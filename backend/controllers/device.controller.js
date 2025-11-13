const Device = require('../models/Device');

const createDevice = async (req, res) => {
  try {
    const { name, deviceId, type } = req.body;

    // Validate input
    if (!name || !deviceId || !type) {
      return res.status(400).json({ message: 'Name, device ID, and type are required' });
    }

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device with this ID already exists' });
    }

    // Create new device
    const device = new Device({ name, deviceId, type });
    await device.save();

    res.status(201).json({
      message: 'Device created successfully',
      device
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating device', error: error.message });
  }
};

const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error: error.message });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching device', error: error.message });
  }
};

const updateDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['on', 'off'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (on/off) is required' });
    }
    
    const device = await Device.findByIdAndUpdate(
      id,
      { status, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.emit('device_status', {
      deviceId: device.deviceId,
      status: device.status,
      timestamp: device.lastUpdated
    });
    
    res.json({
      message: 'Device status updated successfully',
      device
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating device status', error: error.message });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findByIdAndDelete(id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting device', error: error.message });
  }
};

module.exports = { createDevice, getDevices, getDeviceById, updateDeviceStatus, deleteDevice };
