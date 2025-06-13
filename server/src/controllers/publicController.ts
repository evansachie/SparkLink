import { Request, Response } from 'express';
import prisma from '../config/database';

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

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        country: true,
        profilePicture: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get profile with social links
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        socialLinks: {
          orderBy: { order: 'asc' }
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
          profilePicture: user.profilePicture
        },
        profile: {
          bio: profile.bio,
          tagline: profile.tagline,
          backgroundImage: profile.backgroundImage,
          countryFlag: profile.countryFlag,
          showPoweredBy: profile.showPoweredBy,
          socialLinks: profile.socialLinks
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

    // Track page view
    await trackPageView(user.id, page.id, req);

    res.json({
      status: 'SUCCESS',
      data: { page }
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
