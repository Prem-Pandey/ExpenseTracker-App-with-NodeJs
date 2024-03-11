const express = require('express');

const passwordController = require('../controllers/password');

const router = express.Router();

router.get('/forgot-password', passwordController.getForgotPassword);
router.post('/forgot-password', passwordController.postForgotPassword);



module.exports = router;