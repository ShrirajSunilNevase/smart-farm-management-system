require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/land', require('./routes/land'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/weather', require('./routes/weather'));

app.get('/', (req, res) => res.json({ message: '🌾 Smart Farm API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
