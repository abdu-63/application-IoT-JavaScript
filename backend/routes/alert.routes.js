const express = require('express');
const { getAlerts, acknowledgeAlert, deleteAlert } = require('../controllers/alert.controller');

const router = express.Router();

router.get('/', getAlerts);
router.patch('/:id/acknowledge', acknowledgeAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
