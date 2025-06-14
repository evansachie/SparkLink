import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import { PageType, SubscriptionTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Get all pages for a user's profile
 */
export const getPages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Get all pages for the profile
    const pages = await prisma.page.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' }
    });

    res.json({
      status: 'SUCCESS',
      data: { pages }
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch pages'
    });
  }
};

/**
 * Get a specific page by ID
 */
export const getPageById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pageId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Get the page
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        profileId: profile.id
      }
    });

    if (!page) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      data: { page }
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch page'
    });
  }
};

/**
 * Create a new page
 */
export const createPage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, title, slug, content, isPublished, isPasswordProtected, password } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!type || !title || !slug) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Type, title, and slug are required'
      });
    }

    // Check if page type is valid
    if (!Object.values(PageType).includes(type as PageType)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid page type'
      });
    }

    // Get user with subscription information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true }
    });

    // Check password protection permissions
    if (isPasswordProtected) {
      if (user?.subscription === 'STARTER') {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Password protection requires a RISE or BLAZE subscription',
          requiredTier: 'RISE'
        });
      }
      
      if (!password) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Password is required for password-protected pages'
        });
      }
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

    // Check if slug is unique for this profile
    const existingPage = await prisma.page.findFirst({
      where: {
        profileId: profile.id,
        slug
      }
    });

    if (existingPage) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'A page with this slug already exists'
      });
    }

    // Get count of existing pages for ordering
    const pageCount = await prisma.page.count({
      where: { profileId: profile.id }
    });

    // Hash password if page is password protected
    let hashedPassword = null;
    if (isPasswordProtected && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create new page
    const page = await prisma.page.create({
      data: {
        profileId: profile.id,
        type: type as PageType,
        title,
        slug,
        content: content || {},
        isPublished: isPublished || false,
        order: pageCount, // Place at the end by default
        isPasswordProtected: Boolean(isPasswordProtected),
        password: hashedPassword
      }
    });

    // Remove password from response
    const { password: _, ...pageWithoutPassword } = page;

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Page created successfully',
      data: { page: pageWithoutPassword }
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create page'
    });
  }
};

/**
 * Update an existing page
 */
export const updatePage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pageId } = req.params;
    const { title, slug, content, isPublished, isPasswordProtected, password } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Check if page exists and belongs to user
    const existingPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        profileId: profile.id
      }
    });

    if (!existingPage) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found'
      });
    }

    // If slug is being changed, check if the new slug is unique
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.page.findFirst({
        where: {
          profileId: profile.id,
          slug,
          id: { not: pageId }
        }
      });

      if (slugExists) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A page with this slug already exists'
        });
      }
    }

    // Get user with subscription information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true }
    });

    // Check password protection permissions
    if (isPasswordProtected !== undefined && isPasswordProtected !== existingPage.isPasswordProtected) {
      if (user?.subscription === 'STARTER') {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Password protection requires a RISE or BLAZE subscription',
          requiredTier: 'RISE'
        });
      }
      
      if (isPasswordProtected && !password && !existingPage.password) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Password is required when enabling password protection'
        });
      }
    }

    // Hash password if it's provided or if protection is newly enabled
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Prepare update data
    const updateData: any = {
      title,
      slug,
      content,
      isPublished,
      isPasswordProtected
    };

    // Only update password if a new one is provided
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }
    
    // If password protection is being turned off, remove the password
    if (isPasswordProtected === false) {
      updateData.password = null;
    }

    // Update page with clean undefined values
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      )
    });

    // Remove password from response
    const { password: _, ...pageWithoutPassword } = updatedPage;

    res.json({
      status: 'SUCCESS',
      message: 'Page updated successfully',
      data: { page: pageWithoutPassword }
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update page'
    });
  }
};

/**
 * Delete a page
 */
export const deletePage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pageId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Check if page exists and belongs to user
    const existingPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        profileId: profile.id
      }
    });

    if (!existingPage) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found'
      });
    }

    // Delete page
    await prisma.page.delete({
      where: { id: pageId }
    });

    // Reorder remaining pages
    const remainingPages = await prisma.page.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' }
    });

    await Promise.all(
      remainingPages.map((page, index) =>
        prisma.page.update({
          where: { id: page.id },
          data: { order: index }
        })
      )
    );

    res.json({
      status: 'SUCCESS',
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete page'
    });
  }
};

/**
 * Reorder pages
 */
export const reorderPages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pageOrders } = req.body; // Array of {id, order}
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'pageOrders must be an array'
      });
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Update order for each page
    await Promise.all(
      pageOrders.map(({ id, order }) =>
        prisma.page.updateMany({
          where: {
            id,
            profileId: profile.id
          },
          data: { order }
        })
      )
    );

    // Get updated pages
    const pages = await prisma.page.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Pages reordered successfully',
      data: { pages }
    });
  } catch (error) {
    console.error('Reorder pages error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder pages'
    });
  }
};

/**
 * Verify password for a password-protected page
 */
export const verifyPagePassword = async (req: Request, res: Response) => {
  try {
    const { pageId, password } = req.body;
    
    if (!pageId || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Page ID and password are required'
      });
    }

    // Find the page
    const page = await prisma.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Page not found'
      });
    }

    // If page is not password protected, no need to verify
    if (!page.isPasswordProtected) {
      return res.json({
        status: 'SUCCESS',
        message: 'Page is not password protected',
        data: { 
          valid: true,
          pageId 
        }
      });
    }

    // If page is password protected but no password is set (should not happen)
    if (!page.password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Page is password protected but no password is set'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, page.password);

    if (isValid) {
      // Generate a temporary access token for this page
      // This could use JWT or a simple short-lived token in a separate table
      // For simplicity, we'll just return success here
      
      res.json({
        status: 'SUCCESS',
        message: 'Password verified successfully',
        data: {
          valid: true,
          pageId,
          timestamp: Date.now(),
          // Actual implementation would include a session token here
        }
      });
    } else {
      res.status(403).json({
        status: 'ERROR',
        message: 'Invalid password',
        data: {
          valid: false
        }
      });
    }
  } catch (error) {
    console.error('Verify page password error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to verify page password'
    });
  }
};
