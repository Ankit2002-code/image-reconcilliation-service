const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/identify', contactController.identify);

module.exports = router;