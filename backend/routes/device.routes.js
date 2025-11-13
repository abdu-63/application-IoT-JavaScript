const express = require('express');
const { createDevice, getDevices, getDeviceById, updateDeviceStatus, deleteDevice } = require('../controllers/device.controller');

const router = express.Router();

router.post('/', createDevice);
router.get('/', getDevices);
router.get('/:id', getDeviceById);
router.patch('/:id/status', updateDeviceStatus);
router.delete('/:id', deleteDevice);

module.exports = router;
