import express from 'express';
import { signup, verifyOtp, login, googleAuth } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/google', googleAuth);

export default router;