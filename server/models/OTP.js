const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String, 
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

//a function -> to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyPro",
      otpTemplate(otp),
    );
    console.log("Email sent Successfully: ", mailResponse);
  } catch (error) {
    console.log("error occured while sending mails: ", error);
    throw error;
  }
}

try{
OTPSchema.pre("save", async function () {
  await sendVerificationEmail(this.email, this.otp);
  console.log("OTP saved successfully");
});}
catch(error){
  console.log("OTP Failed");
}

module.exports = mongoose.model("OTP", OTPSchema);
