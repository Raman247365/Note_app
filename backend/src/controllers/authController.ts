import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const otpStore = new Map<string, { otp: string; expires: number; userData?: any }>();

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, dateOfBirth } = req.body;

    // Validation
    if (!email || !password || !name || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date of birth' });
    }

    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      return res.status(400).json({ error: 'Must be at least 13 years old' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 300000, userData: { name, dateOfBirth } });

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Notes App - Verify your email',
          html: `
            <h2>Email Verification</h2>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
          `
        });
      } catch (emailError) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Email failed, OTP for ${email}: ${otp}`);
        }
        return res.status(500).json({ error: 'Failed to send email' });
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Development OTP for ${email}: ${otp}`);
      }
    }

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Signup error:', error);
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, password, name, dateOfBirth } = req.body;

    const storedOtp = otpStore.get(email.toLowerCase());
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = storedOtp.userData || { name, dateOfBirth };
    const user = new User({ 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      name: userData.name.trim(),
      dateOfBirth: new Date(userData.dateOfBirth)
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );

    otpStore.delete(email.toLowerCase());
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('VerifyOtp error:', error);
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: 'Google authentication not configured' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name } = payload;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({ 
        email: email.toLowerCase(), 
        name: name || 'Google User', 
        googleId: payload.sub 
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );
    
    res.json({ token: jwtToken, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Google auth error:', error);
    }
    res.status(500).json({ error: 'Server error' });
  }
};