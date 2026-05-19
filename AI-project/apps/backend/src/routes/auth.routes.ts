// ============================================================
// ResQ AI — Auth Routes (JWT + OTP)
// ============================================================

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { validate } from '../middleware/validate';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

const router = Router();

// ── Mock user store (replace with Prisma in production) ───────
const users: any[] = [
  {
    id: 'USR-001',
    email: 'admin@resqai.pk',
    passwordHash: bcrypt.hashSync('admin123', 10),
    name: 'System Admin',
    role: 'SUPER_ADMIN',
    isVerified: true,
    phone: '+923001234567',
  },
  {
    id: 'USR-002',
    email: 'responder@resqai.pk',
    passwordHash: bcrypt.hashSync('responder123', 10),
    name: 'Ali Hassan',
    role: 'RESPONDER',
    isVerified: true,
    phone: '+923007654321',
  },
  {
    id: 'USR-003',
    email: 'citizen@resqai.pk',
    passwordHash: bcrypt.hashSync('citizen123', 10),
    name: 'Fatima Khan',
    role: 'CITIZEN',
    isVerified: true,
    phone: '+923009876543',
  },
];

// ── POST /auth/login ──────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    logger.info(`🔐 User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
      },
    });
  }
);

// ── POST /auth/signup ─────────────────────────────────────────
router.post(
  '/signup',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty(),
    body('phone').optional().isMobilePhone('any'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { email, password, name, phone } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      passwordHash,
      name,
      role: 'CITIZEN',
      isVerified: false,
      phone,
    };

    users.push(newUser);

    const token = generateToken({ id: newUser.id, email, role: 'CITIZEN' });

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your phone number.',
      data: {
        token,
        user: { id: newUser.id, email, name, role: 'CITIZEN' },
      },
    });
  }
);

// ── POST /auth/verify-otp ─────────────────────────────────────
router.post('/verify-otp', [body('otp').isLength({ min: 6, max: 6 })], validate, (req: Request, res: Response) => {
  // Mock OTP verification (always 123456 for demo)
  const { otp } = req.body;
  if (otp === '123456') {
    res.json({ success: true, message: 'Phone number verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// ── POST /auth/refresh ────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: { token } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  // Mock implementation
  res.json({
    success: true,
    data: users[0],
  });
});

export default router;
