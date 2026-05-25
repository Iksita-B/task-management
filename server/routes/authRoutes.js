const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const Otp = require("../models/Otp");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("../utils/sendEmail");
const authMiddleware = require("../middleware/authMiddleware");

const ensureBoardColumns = async (user) => {
  if (Array.isArray(user.boardColumns) && user.boardColumns.length) {
    return user.boardColumns;
  }

  user.boardColumns = [...User.defaultBoardColumns];
  await user.save();
  return user.boardColumns;
};

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
      username: name,
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
        name: user.username,
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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

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

router.post('/login', async (req, res) => {
  try {
    const email = req.body?.email?.trim()?.toLowerCase();
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const boardColumns = await ensureBoardColumns(user);
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        boardColumns,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const boardColumns = await ensureBoardColumns(req.user);

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.username,
      email: req.user.email,
      boardColumns,
    },
  });
});

router.post('/board-columns', authMiddleware, async (req, res) => {
  try {
    await ensureBoardColumns(req.user);
    const label = (req.body?.label || '').trim();

    if (!label) {
      return res.status(400).json({
        success: false,
        message: 'Column label is required',
      });
    }

    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Column label is invalid',
      });
    }

    const alreadyExists = req.user.boardColumns.some((column) => column.key === key);

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'Column already exists',
      });
    }

    req.user.boardColumns.push({ key, label });
    await req.user.save();

    res.status(201).json({
      success: true,
      boardColumns: req.user.boardColumns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add column',
    });
  }
});

router.put('/board-columns', authMiddleware, async (req, res) => {
  try {
    const nextBoardColumns = Array.isArray(req.body?.boardColumns) ? req.body.boardColumns : [];

    if (!nextBoardColumns.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one column is required',
      });
    }

    const normalizedColumns = nextBoardColumns.map((column) => ({
      key: (column?.key || '').trim(),
      label: (column?.label || '').trim(),
    }));

    const hasInvalidColumn = normalizedColumns.some((column) => !column.key || !column.label);

    if (hasInvalidColumn) {
      return res.status(400).json({
        success: false,
        message: 'All columns must include a key and label',
      });
    }

    const uniqueKeys = new Set(normalizedColumns.map((column) => column.key));

    if (uniqueKeys.size !== normalizedColumns.length) {
      return res.status(400).json({
        success: false,
        message: 'Column keys must be unique',
      });
    }

    req.user.boardColumns = normalizedColumns;
    await req.user.save();

    res.json({
      success: true,
      boardColumns: req.user.boardColumns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update board columns',
    });
  }
});

module.exports = router;