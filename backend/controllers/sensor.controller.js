const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');

const createSensorData = async (req, res) => {
  try {
    const { deviceId, temperature, humidity, motion, light } = req.body;

    // Validate input
    if (!deviceId || temperature === undefined || humidity === undefined || 
        motion === undefined || light === undefined) {
      return res.status(400).json({ message: 'All sensor data fields are required' });
    }

    // Create sensor data
    const sensorData = new Sensor({
      deviceId,
      temperature,
      humidity,
      motion,
      light
    });

    await sensorData.save();
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.emit('sensor_data', {
      deviceId,
      temperature,
      humidity,
      motion,
      light,
      timestamp: sensorData.timestamp
    });

    // Check thresholds and create alerts if needed
    checkThresholdsAndAlert(deviceId, temperature, humidity, light, motion, io);

    res.status(201).json({
      message: 'Sensor data saved successfully',
      data: sensorData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving sensor data', error: error.message });
  }
};

const getSensorData = async (req, res) => {
  try {
    const { deviceId, limit = 100 } = req.query;
    
    let query = {};
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    const sensorData = await Sensor.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(sensorData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor data', error: error.message });
  }
};

const getLatestSensorData = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' });
    }
    
    const latestData = await Sensor.findOne({ deviceId })
      .sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({ message: 'No data found for this device' });
    }
    
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest sensor data', error: error.message });
  }
};

// Function to check thresholds and create alerts
const checkThresholdsAndAlert = async (deviceId, temperature, humidity, light, motion, io) => {
  // Temperature thresholds
  if (temperature > 28) {
    createAlert(deviceId, 'temperature', temperature, 28, 'critical', 
                `High temperature alert: ${temperature}°C`, io);
  } else if (temperature > 26) {
    createAlert(deviceId, 'temperature', temperature, 26, 'warning', 
                `Elevated temperature: ${temperature}°C`, io);
  }
  
  // Humidity thresholds
  if (humidity > 70) {
    createAlert(deviceId, 'humidity', humidity, 70, 'warning', 
                `High humidity: ${humidity}%`, io);
  } else if (humidity < 30) {
    createAlert(deviceId, 'humidity', humidity, 30, 'warning', 
                `Low humidity: ${humidity}%`, io);
  }
  
  // Motion detection
  if (motion === 1) {
    createAlert(deviceId, 'motion', motion, 1, 'info', 
                'Motion detected', io);
  }
  
  // Light thresholds
  if (light > 900) {
    createAlert(deviceId, 'light', light, 900, 'warning', 
                `Bright environment: ${light} lux`, io);
  } else if (light < 100) {
    createAlert(deviceId, 'light', light, 100, 'warning', 
                `Dark environment: ${light} lux`, io);
  }
};

// Function to create alerts
const createAlert = async (deviceId, sensorType, value, threshold, type, message, io) => {
  try {
    const alert = new Alert({
      deviceId,
      sensorType,
      value,
      threshold,
      type,
      message
    });
    
    await alert.save();
    
    // Emit real-time alert via Socket.IO
    io.emit('alert', {
      deviceId,
      sensorType,
      value,
      threshold,
      type,
      message,
      timestamp: alert.timestamp
    });
  } catch (error) {
    console.error('Error creating alert:', error);
  }
};

module.exports = { createSensorData, getSensorData, getLatestSensorData };
