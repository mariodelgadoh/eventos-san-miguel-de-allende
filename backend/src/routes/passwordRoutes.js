const express = require('express');
const { requestPasswordReset, verifyCode, resetPassword } = require('../controllers/passwordController');
const router = express.Router();

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

module.exports = router;