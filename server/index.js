const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require("./routes/authRoutes");

const app = express();

// connect database
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/todos', todoRoutes);
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});