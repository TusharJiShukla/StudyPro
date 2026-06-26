const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ====================== SEND OTP ======================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("BE OTP called for email:", email);
    
    // Check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);

    // ✅ Delete any existing OTPs for this email (cleanup)
    await OTP.deleteMany({ email });

    // Create OTP payload
    const otpPayload = {
      email,
      otp,
    };

    // Save OTP in Database
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Document Saved:", otpBody);

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp, // Only for development, remove in production
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signUp
exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password does not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // ✅ Find most recent OTP (last 10 minutes)
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Recent OTP found:", recentOtp);
    console.log("OTP provided by user:", otp);

    // Validate OTP
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    } 
    
    if (recentOtp[0].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter the correct OTP.",
      });
    }

    // Check if OTP is expired (createdAt > 5 minutes)
    const otpCreatedAt = new Date(recentOtp[0].createdAt);
    const now = new Date();
    const diffMinutes = (now - otpCreatedAt) / (1000 * 60);
    
    if (diffMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile entry
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    });

    // Create user entry
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType || "Student",
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // ✅ Delete used OTP
    await OTP.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
      error: error.message,
    });
  }
};
// ==============================
// LOGIN
// ==============================

exports.login = async (req, res) => {
  try {
    // GET DATA FROM REQUEST BODY
    const { email, password } = req.body;
    // VALIDATE DATA
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }

    // ==========================================
    // CHECK USER EXISTS OR NOT
    // ==========================================

    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first",
      });
    }
    console.log("USER:", user);
    // ==========================================
    // PASSWORD MATCHING
    // ==========================================

    if (await bcrypt.compare(password, user.password)) {
      // CREATE JWT PAYLOAD
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
    
      console.log("payload: ", payload);
      // GENERATE JWT TOKEN
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,

        {
          expiresIn: "5h",
        },
      );
      console.log("TOKEN in login:", token);
      console.log("Type of Token: ", typeof(token))
      // ADD TOKEN TO USER OBJECT
      user.token = token;

      // ==========================================
      // REMOVE PASSWORD FROM RESPONSE
      // ==========================================

      user.password = undefined;

      // ==========================================
      // CREATE COOKIE OPTIONS
      // ==========================================

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      // ==========================================
      // SEND COOKIE + RESPONSE
      // ==========================================

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully",
      });
    }

    // ==========================================
    // PASSWORD INCORRECT
    // ==========================================
    else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    // ==========================================
    // ERROR HANDLING
    // ==========================================

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

exports.changePassword = async (req, res) => {
  try {
    // ==========================================
    // GET DATA FROM REQUEST BODY
    // ==========================================

    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

    // ==========================================
    // VALIDATE INPUT DATA
    // ==========================================

    if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================================
    // CHECK NEW PASSWORD MATCH
    // ==========================================

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and Confirm Password do not match",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await User.findOne({ email });

    // ==========================================
    // CHECK USER EXISTS OR NOT
    // ==========================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // VERIFY OLD PASSWORD
    // ==========================================

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Old Password is incorrect",
      });
    }

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    // ==========================================
    // UPDATE PASSWORD IN DATABASE
    // ==========================================

    user.password = encryptedPassword;

    await user.save();

    // ==========================================
    // RETURN SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    // ==========================================
    // ERROR HANDLING
    // ==========================================

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing password",
    });
  }
};
