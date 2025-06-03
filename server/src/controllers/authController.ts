import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { generateOTP, sendVerificationEmail } from '../utils/emailService';
import prisma from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email and password are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerificationToken: otp,
        emailVerificationExpires: otpExpires
      }
    });

    // Send verification email
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        userId: user.id,
        email: user.email,
        requiresVerification: true
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error'
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email and OTP are required'
      });
    }

    // Find user with valid OTP
    const user = await prisma.user.findFirst({
      where: {
        email,
        emailVerificationToken: otp,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid or expired verification code'
      });
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email
    });

    // Return user without password
    const { password: _, emailVerificationToken: __, emailVerificationExpires: ___, ...userWithoutSensitiveData } = updatedUser;

    res.json({
      status: 'SUCCESS',
      message: 'Email verified successfully',
      data: {
        user: userWithoutSensitiveData,
        token,
        isNewUser: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error'
    });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email is required'
      });
    }

    // Find unverified user
    const user = await prisma.user.findFirst({
      where: {
        email,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User not found or already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: otp,
        emailVerificationExpires: otpExpires
      }
    });

    // Send verification email
    await sendVerificationEmail(email, otp, user.firstName || undefined);

    res.json({
      status: 'SUCCESS',
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'SUCCESS',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error'
    });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?message=Authentication failed`);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Check if user needs to complete profile
    const needsProfile = !user.firstName || !user.lastName || !user.username;

    // Redirect to frontend with token
    const redirectUrl = needsProfile 
      ? `${process.env.CLIENT_URL}/onboarding?token=${token}&new_user=true`
      : `${process.env.CLIENT_URL}/dashboard?token=${token}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error?message=Authentication failed`);
  }
};
