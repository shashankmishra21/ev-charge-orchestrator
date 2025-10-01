import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth authentication endpoint
router.post('/google', async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;
    
    console.log('🔐 Google auth request received:', { email, name });

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      console.log('👤 Existing user found:', user.id);
      // Update existing user name if changed
      user = await prisma.user.update({
        where: { email },
        data: { 
          name,
          //can update other fields here if needed
        }
      });
      console.log('Updated existing user:', user.id);
    } else {
      console.log('Creating new user...');
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: '', // Empty for Google OAuth users
          phone: null, // Will be null initially
        }
      });
      console.log('New user created with ID:', user.id);
    }

    res.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Google auth database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
