const express = require('express');
const { createSensorData, getSensorData, getLatestSensorData } = require('../controllers/sensor.controller');

const router = express.Router();

router.post('/', createSensorData);
router.get('/', getSensorData);
router.get('/latest', getLatestSensorData);

module.exports = router;
