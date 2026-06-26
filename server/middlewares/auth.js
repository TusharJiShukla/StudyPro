const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

exports.auth = async (req, res, next) => {
  try {
    let token = null;
    
    console.log("========== AUTH MIDDLEWARE ==========");
    
    // ✅ FIX: Check if cookies exist before accessing
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("✅ Token found in cookies");
    }
    
    // Check body
    if (!token && req.body && req.body.token) {
      token = req.body.token;
      console.log("✅ Token found in body");
    }
    
    // Check Authorization header
    if (!token && req.headers && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      console.log("✅ Authorization header found");
      
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("✅ Token extracted from Bearer prefix");
      } else {
        token = authHeader;
        console.log("✅ Token extracted directly");
      }
    }

    if (!token) {
      console.log("❌ No token found in any source");
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    console.log("Token length:", token.length);
    console.log("Token first 20 chars:", token.substring(0, 20));

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified successfully!");
      console.log("Decoded user ID:", decode.id);
      console.log("Decoded email:", decode.email);
      
      req.user = decode;
      next();
    } catch (err) {
      console.log("❌ JWT Verification failed!");
      console.log("Error:", err.message);
      
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (error) {
    console.log("❌ Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// ==========================================
// IS STUDENT MIDDLEWARE
// ==========================================

exports.isStudent = async (req, res, next) => {
  try {
    if (!req.user || req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// ==========================================
// IS INSTRUCTOR MIDDLEWARE
// ==========================================

exports.isInstructor = async (req, res, next) => {
  try {
    console.log("isInstructor - User accountType:", req.user?.accountType);
    
    if (!req.user || req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// ==========================================
// IS ADMIN MIDDLEWARE
// ==========================================

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};