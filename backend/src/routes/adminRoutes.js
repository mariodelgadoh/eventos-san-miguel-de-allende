const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(auth, isAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/role', adminController.changeUserRole);

module.exports = router;