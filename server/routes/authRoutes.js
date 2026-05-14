const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const Otp = require("../models/Otp");
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("../utils/sendEmail");

router.post("/create-account", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const signupToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      signupToken,
      process.env.JWT_SECRET
    );

    const { name, password } = req.body;

    const existingUser = await User.findOne({
      email: decoded.email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email: decoded.email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Account created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOTP();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await Otp.deleteMany({ email });

    const signupToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({
      success: true,
      message: "OTP verified",
      signupToken,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;