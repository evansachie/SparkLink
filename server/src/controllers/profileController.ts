import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import cloudinary from '../config/cloudinary';

/**
 * Get the current user's profile
 */
export const getCurrentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get user profile
    let profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        socialLinks: true
      }
    });

    // If profile doesn't exist, create an empty one
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          isPublished: false,
          showPoweredBy: true
        },
        include: {
          socialLinks: true
        }
      });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        country: true,
        phone: true,
        profilePicture: true,
        subscription: true
      }
    });

    res.json({
      status: 'SUCCESS',
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const { 
      firstName, lastName, username, country, phone,
      bio, tagline, countryFlag
    } = req.body;

    // Check if username already exists (if provided)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Username already taken'
        });
      }
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        country,
        phone
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        country: true,
        phone: true,
        profilePicture: true,
        subscription: true
      }
    });

    // Find or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId },
        data: {
          bio,
          tagline,
          countryFlag
        },
        include: {
          socialLinks: true
        }
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId,
          bio,
          tagline,
          countryFlag,
          isPublished: false,
          showPoweredBy: true
        },
        include: {
          socialLinks: true
        }
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update profile'
    });
  }
};

/**
 * Check username availability
 */
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    res.json({
      status: 'SUCCESS',
      data: {
        username,
        available: !user
      }
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to check username availability'
    });
  }
};

/**
 * Update social links
 */
export const updateSocialLinks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Links must be an array'
      });
    }

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          isPublished: false,
          showPoweredBy: true
        }
      });
    }

    // Delete existing links
    await prisma.socialLink.deleteMany({
      where: { profileId: profile.id }
    });

    // Create new links
    const socialLinks = await Promise.all(
      links.map((link, index) => 
        prisma.socialLink.create({
          data: {
            profileId: profile.id,
            platform: link.platform,
            url: link.url,
            order: index
          }
        })
      )
    );

    res.json({
      status: 'SUCCESS',
      message: 'Social links updated successfully',
      data: {
        socialLinks
      }
    });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update social links'
    });
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No file uploaded'
      });
    }

    // File is already uploaded to Cloudinary by multer-storage-cloudinary
    const imageUrl = (req.file as any).path;

    // Update user profile picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: imageUrl
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        country: true,
        phone: true,
        profilePicture: true,
        subscription: true
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Profile picture uploaded successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to upload profile picture'
    });
  }
};

/**
 * Upload background image
 */
export const uploadBackgroundImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No file uploaded'
      });
    }

    // File is already uploaded to Cloudinary by multer-storage-cloudinary
    const imageUrl = (req.file as any).path;

    // Find or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId },
        data: {
          backgroundImage: imageUrl
        }
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId,
          backgroundImage: imageUrl,
          isPublished: false,
          showPoweredBy: true
        }
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Background image uploaded successfully',
      data: {
        profile
      }
    });
  } catch (error) {
    console.error('Background image upload error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to upload background image'
    });
  }
};
