import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import { PageType } from '@prisma/client';

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
    const { type, title, slug, content, isPublished } = req.body;
    
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

    // Create new page
    const page = await prisma.page.create({
      data: {
        profileId: profile.id,
        type: type as PageType,
        title,
        slug,
        content: content || {},
        isPublished: isPublished || false,
        order: pageCount // Place at the end by default
      }
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Page created successfully',
      data: { page }
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
    const { title, slug, content, isPublished } = req.body;
    
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

    // Update page
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        slug,
        content,
        isPublished
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Page updated successfully',
      data: { page: updatedPage }
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
