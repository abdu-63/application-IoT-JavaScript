const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const sensorRoutes = require('./routes/sensor.routes');
const deviceRoutes = require('./routes/device.routes');
const alertRoutes = require('./routes/alert.routes');

// Import middleware
const { authenticateToken } = require('./middleware/auth.middleware');

// Import MQTT service
const mqttService = require('./services/mqtt.service');

// Import models
const Device = require('./models/Device');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot-dashboard')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle device commands from frontend
  socket.on('device_command', async (command) => {
    console.log('Device command received:', command);
    
    try {
      // Validate device exists
      const device = await Device.findOne({ deviceId: command.deviceId });
      if (!device) {
        socket.emit('command_error', { 
          message: 'Device not found', 
          command 
        });
        return;
      }
      
      // Send command to MQTT service
      mqttService.publishCommand(command.deviceId, command.action);
      
      // Acknowledge command
      socket.emit('command_ack', { 
        success: true, 
        command,
        timestamp: new Date().toISOString()
      });
      
      console.log('Command sent to device:', command);
    } catch (error) {
      console.error('Error handling device command:', error);
      socket.emit('command_error', { 
        message: 'Error processing command', 
        command,
        error: error.message 
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', authenticateToken, sensorRoutes);
app.use('/api/devices', authenticateToken, deviceRoutes);
app.use('/api/alerts', authenticateToken, alertRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'IoT Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start MQTT service
mqttService.connectMQTT(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`IoT Backend server running on port ${PORT}`);
});
