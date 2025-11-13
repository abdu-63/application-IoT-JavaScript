const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const { deviceId, limit = 50, acknowledged } = req.query;
    
    let query = {};
    if (deviceId) {
      query.deviceId = deviceId;
    }
    if (acknowledged !== undefined) {
      query.acknowledged = acknowledged === 'true';
    }
    
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({
      message: 'Alert acknowledged successfully',
      alert
    });
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging alert', error: error.message });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndDelete(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert', error: error.message });
  }
};

module.exports = { getAlerts, acknowledgeAlert, deleteAlert };
