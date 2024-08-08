const router = require('express').Router();
const auth = require('../controllers/auth');
const checkAuth = require('../middlewares/checkAuth');

router.post('/send-otp', auth.sendOtp);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/get-profile',checkAuth, auth.getProfile);

module.exports = router;