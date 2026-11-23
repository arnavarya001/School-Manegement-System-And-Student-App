const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/school', require('./routes/schoolRoutes'));
app.use('/api/v1/classes', require('./routes/classRoutes'));
app.use('/api/v1/students', require('./routes/studentRoutes'));
app.use('/api/v1/fees', require('./routes/feeRoutes'));
app.use('/api/v1/bills', require('./routes/billRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/rooms', require('./routes/roomRoutes'));
app.use('/api/v1/electricity', require('./routes/electricityRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/announcements', require('./routes/announcementRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/suppliers', require('./routes/supplierRoutes'));
app.use('/api/v1/staff', require('./routes/staffRoutes'));


// Verification route
app.get('/', (req, res) => res.json({ status: 'Online', system: 'St. Michel School Management System' }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[32m%s\x1b[0m', '================================================');
    console.log('\x1b[32m%s\x1b[0m', `🚀 ST. MICHEL BACKEND IS LIVE ON PORT ${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', `📱 EMULATOR LINK: http://10.0.2.2:${PORT}`);
    console.log('\x1b[33m%s\x1b[0m', `👤 ADMIN: admin@stmichel.com / password123`);
    console.log('\x1b[32m%s\x1b[0m', '================================================');
  });
};

startServer();

