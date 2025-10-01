import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        phone?: string | null;
        created_at: Date;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user email from Authorization header (sent by frontend)
    const userEmail = req.headers.authorization || req.headers['x-user-email'];
    
    console.log('🔐 Auth middleware - checking user:', userEmail);
    
    if (!userEmail || typeof userEmail !== 'string') {
      console.log('❌ No user email in headers');
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required. Please login.' 
      });
    }

    // Find user in database by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log('❌ User not found in database:', userEmail);
      return res.status(401).json({ 
        success: false, 
        error: 'User not found. Please login again.' 
      });
    }

    console.log('✅ User authenticated:', user.id, user.name);

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at
    };

    next();
  } catch (error) {
    console.error('💥 Authentication middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

export default authenticateUser;
