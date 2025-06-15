import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

/**
 * Get a user's public profile by username
 */
export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username is required'
      });
    }

    // Find user by username with fallback for missing verification fields
    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          country: true,
          profilePicture: true,
          subscription: true,
          hasVerifiedBadge: true
        }
      });
    } catch (error) {
      // Fallback to raw query if hasVerifiedBadge field doesn't exist
      const rawUser = await prisma.$queryRaw`
        SELECT 
          id, "firstName", "lastName", username, country, "profilePicture", subscription,
          COALESCE("hasVerifiedBadge", false) as "hasVerifiedBadge"
        FROM "users" 
        WHERE username = ${username}
        LIMIT 1
      `;
      user = Array.isArray(rawUser) && rawUser[0] ? rawUser[0] : null;
    }

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile with social links and template
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        socialLinks: {
          orderBy: { order: 'asc' }
        },
        template: {
          select: {
            id: true,
            name: true,
            features: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // If profile is not published, return limited info
    if (!profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'This profile is not published yet',
        data: {
          username: user.username,
          isPublished: false
        }
      });
    }

    // Track view
    await trackProfileView(user.id, req);

    res.json({
      status: 'SUCCESS',
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          country: user.country,
          profilePicture: user.profilePicture,
          hasVerifiedBadge: user.hasVerifiedBadge || false
        },
        profile: {
          bio: profile.bio,
          tagline: profile.tagline,
          backgroundImage: profile.backgroundImage,
          countryFlag: profile.countryFlag,
          showPoweredBy: profile.showPoweredBy,
          socialLinks: profile.socialLinks,
          template: profile.template,
          colorScheme: profile.colorScheme
        }
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Get a user's public pages
 */
export const getPublicPages = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username is required'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'This profile is not published yet'
      });
    }

    // Get published pages only, ordered by their display order
    const pages = await prisma.page.findMany({
      where: {
        profileId: profile.id,
        isPublished: true
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        order: true
      }
    });

    res.json({
      status: 'SUCCESS',
      data: { pages }
    });
  } catch (error) {
    console.error('Get public pages error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch pages'
    });
  }
};

/**
 * Get a specific public page by slug
 */
export const getPublicPageBySlug = async (req: Request, res: Response) => {
  try {
    const { username, slug } = req.params;
    
    if (!username || !slug) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username and slug are required'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'This profile is not published yet'
      });
    }

    // Get the specific page
    const page = await prisma.page.findFirst({
      where: {
        profileId: profile.id,
        slug,
        isPublished: true
      }
    });

    if (!page) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found or not published'
      });
    }

    // Check if page is password protected
    if (page.isPasswordProtected) {
      // Only return essential data about the page, not the content
      const { password: _, content: __, ...pageWithoutSensitiveData } = page;
      
      return res.json({
        status: 'SUCCESS',
        data: { 
          page: {
            ...pageWithoutSensitiveData,
            isPasswordProtected: true,
            requiresPassword: true
          }
        }
      });
    }

    // Track page view
    await trackPageView(user.id, page.id, req);

    // Return full page data including content
    const { password: _, ...pageWithoutPassword } = page;
    
    res.json({
      status: 'SUCCESS',
      data: { page: pageWithoutPassword }
    });
  } catch (error) {
    console.error('Get public page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch page'
    });
  }
};

/**
 * Access a password-protected page
 */
export const accessProtectedPage = async (req: Request, res: Response) => {
  try {
    const { username, slug, password } = req.body;
    
    if (!username || !slug) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username and slug are required'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password is required'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'This profile is not published yet'
      });
    }

    // Get the specific page
    const page = await prisma.page.findFirst({
      where: {
        profileId: profile.id,
        slug,
        isPublished: true
      }
    });

    if (!page) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found or not published'
      });
    }

    // Check if page is password protected
    if (!page.isPasswordProtected) {
      // Page is not password protected, just return it
      const { password: _, ...pageWithoutPassword } = page;
      
      await trackPageView(user.id, page.id, req);
      
      return res.json({
        status: 'SUCCESS',
        data: { page: pageWithoutPassword }
      });
    }

    // Verify password
    if (!page.password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Page is password protected but no password is set'
      });
    }

    const isValidPassword = await bcrypt.compare(password, page.password);
    
    if (!isValidPassword) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Invalid password'
      });
    }

    // Password is valid, track view
    await trackPageView(user.id, page.id, req);

    // Return full page data
    const { password: _, ...pageWithoutPassword } = page;
    
    res.json({
      status: 'SUCCESS',
      message: 'Access granted',
      data: { page: pageWithoutPassword }
    });
  } catch (error) {
    console.error('Access protected page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to access protected page'
    });
  }
};

/**
 * Get public gallery items for a user
 */
export const getPublicGallery = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { category, limit = '20', offset = '0' } = req.query;
    
    if (!username) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username is required'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'This profile is not published yet'
      });
    }

    // Build where clause
    const whereClause: any = {
      profileId: profile.id,
      isVisible: true
    };

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    // Get gallery items
    const galleryItems = await prisma.gallery.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        tags: true,
        order: true,
        createdAt: true
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.gallery.count({
      where: whereClause
    });

    // Get unique categories
    const categories = await prisma.gallery.findMany({
      where: { profileId: profile.id, isVisible: true },
      select: { category: true },
      distinct: ['category']
    });

    const uniqueCategories = categories
      .map(item => item.category)
      .filter(Boolean)
      .sort();

    res.json({
      status: 'SUCCESS',
      data: {
        items: galleryItems,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: totalCount > parseInt(offset as string) + parseInt(limit as string)
        },
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Get public gallery error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch gallery'
    });
  }
};

/**
 * Track profile view in analytics
 */
async function trackProfileView(userId: string, req: Request): Promise<void> {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    await prisma.analytics.create({
      data: {
        userId,
        event: 'PROFILE_VIEW',
        data: {
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to track profile view:', error);
    // Don't throw, just log error - this shouldn't block the response
  }
}

/**
 * Track page view in analytics
 */
async function trackPageView(userId: string, pageId: string, req: Request): Promise<void> {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    await prisma.analytics.create({
      data: {
        userId,
        event: 'PAGE_VIEW',
        data: {
          pageId,
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
    // Don't throw, just log error - this shouldn't block the response
  }
}

/**
 * Get client IP address from request object
 */
function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) 
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();
    return ips;
  }
  return req.socket.remoteAddress || '';
}
