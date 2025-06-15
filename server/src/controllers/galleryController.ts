import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import cloudinary from '../config/cloudinary';

interface GalleryItem {
  id: string;
  profileId: string;
  title: string;
  description: string | null;
  imageUrl: string;
  publicId: string;
  category: string | null;
  tags: string[];
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all gallery items for a user's profile
 */
export const getGalleryItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category, limit = '50', offset = '0' } = req.query;
    
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

    // Build where clause
    const whereClause: any = {
      profileId: profile.id,
      isVisible: true
    };

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    // Get gallery items using raw query if needed
    let galleryItems: GalleryItem[];
    let totalCount: number;
    
    try {
      galleryItems = await prisma.gallery.findMany({
        where: whereClause,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      totalCount = await prisma.gallery.count({
        where: whereClause
      });
    } catch (error) {
      console.error('Error querying gallery with Prisma client:', error);
      
      // Fallback to raw query if Gallery model isn't available yet
      const rawItems = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "profileId" = ${profile.id} AND "isVisible" = true
        ORDER BY "order" ASC, "createdAt" DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
      `;
      
      const rawCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "gallery_items" 
        WHERE "profileId" = ${profile.id} AND "isVisible" = true
      `;
      
      galleryItems = rawItems as GalleryItem[];
      totalCount = Array.isArray(rawCount) && rawCount[0] ? Number(rawCount[0].count) : 0;
    }

    // Get unique categories
    let uniqueCategories: string[] = [];
    try {
      const categories = await prisma.gallery.findMany({
        where: { profileId: profile.id, isVisible: true },
        select: { category: true },
        distinct: ['category']
      });
      
      uniqueCategories = categories
        .map((item: { category: string | null }) => item.category)
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Error getting categories:', error);
    }

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
        categories: uniqueCategories.sort()
      }
    });
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch gallery items'
    });
  }
};

/**
 * Upload a new gallery item
 */
export const uploadGalleryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, category, tags } = req.body;
    const file = req.file;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!file) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Image file is required'
      });
    }

    if (!title) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Title is required'
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

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(parsedTags)) {
          parsedTags = [];
        }
      } catch (error) {
        parsedTags = [];
      }
    }

    // Get current item count for ordering
    let itemCount = 0;
    try {
      itemCount = await prisma.gallery.count({
        where: { profileId: profile.id }
      });
    } catch (error) {
      // Fallback for when Gallery model isn't available
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "gallery_items" WHERE "profileId" = ${profile.id}
      `;
      itemCount = Array.isArray(countResult) && countResult[0] ? Number(countResult[0].count) : 0;
    }

    // Create gallery item
    let galleryItem: GalleryItem;
    try {
      galleryItem = await prisma.gallery.create({
        data: {
          profileId: profile.id,
          title,
          description: description || null,
          imageUrl: (file as any).path, // Cloudinary URL
          publicId: (file as any).filename, // Cloudinary public ID
          category: category || null,
          tags: parsedTags,
          order: itemCount,
          isVisible: true
        }
      });
    } catch (error) {
      // Fallback to raw query
      console.error('Error creating with Prisma, using raw query:', error);
      const result = await prisma.$executeRaw`
        INSERT INTO "gallery_items" (
          "id", "profileId", "title", "description", "imageUrl", "publicId", 
          "category", "tags", "order", "isVisible", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, ${profile.id}, ${title}, ${description || null}, 
          ${(file as any).path}, ${(file as any).filename}, ${category || null}, 
          ${parsedTags}, ${itemCount}, true, NOW(), NOW()
        )
      `;
      
      // Get the created item
      const createdItems = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "profileId" = ${profile.id} AND "imageUrl" = ${(file as any).path}
        ORDER BY "createdAt" DESC LIMIT 1
      `;
      
      galleryItem = Array.isArray(createdItems) ? createdItems[0] as GalleryItem : {} as GalleryItem;
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Gallery item uploaded successfully',
      data: { item: galleryItem }
    });
  } catch (error) {
    console.error('Upload gallery item error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to upload gallery item'
    });
  }
};

/**
 * Get gallery item by ID
 */
export const getGalleryItemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    
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

    // Get the gallery item
    let item: GalleryItem | null = null;
    try {
      item = await prisma.gallery.findFirst({
        where: {
          id: itemId,
          profileId: profile.id
        }
      });
    } catch (error) {
      // Fallback to raw query
      const rawItem = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "id" = ${itemId} AND "profileId" = ${profile.id}
        LIMIT 1
      `;
      item = Array.isArray(rawItem) && rawItem[0] ? rawItem[0] as GalleryItem : null;
    }

    if (!item) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Gallery item not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      data: { item }
    });
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch gallery item'
    });
  }
};

/**
 * Update a gallery item
 */
export const updateGalleryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { title, description, category, tags, isVisible } = req.body;
    
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

    // Check if gallery item exists and belongs to user
    let existingItem: GalleryItem | null = null;
    try {
      existingItem = await prisma.gallery.findFirst({
        where: {
          id: itemId,
          profileId: profile.id
        }
      });
    } catch (error) {
      // Fallback to raw query
      const rawItem = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "id" = ${itemId} AND "profileId" = ${profile.id}
        LIMIT 1
      `;
      existingItem = Array.isArray(rawItem) && rawItem[0] ? rawItem[0] as GalleryItem : null;
    }

    if (!existingItem) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Gallery item not found'
      });
    }

    // Parse tags if provided
    let parsedTags: string[] | undefined = undefined;
    if (tags !== undefined) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(parsedTags)) {
          parsedTags = [];
        }
      } catch (error) {
        parsedTags = [];
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (parsedTags !== undefined) updateData.tags = parsedTags;
    if (isVisible !== undefined) updateData.isVisible = Boolean(isVisible);

    // Update gallery item
    let updatedItem: GalleryItem;
    try {
      updatedItem = await prisma.gallery.update({
        where: { id: itemId },
        data: updateData
      });
    } catch (error) {
      // Fallback to raw query
      console.error('Error updating with Prisma, using raw query:', error);
      await prisma.$executeRaw`
        UPDATE "gallery_items" 
        SET "title" = COALESCE(${updateData.title}, "title"),
            "description" = COALESCE(${updateData.description}, "description"),
            "category" = COALESCE(${updateData.category}, "category"),
            "tags" = COALESCE(${updateData.tags}, "tags"),
            "isVisible" = COALESCE(${updateData.isVisible}, "isVisible"),
            "updatedAt" = NOW()
        WHERE "id" = ${itemId}
      `;
      
      // Get the updated item
      const rawItem = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" WHERE "id" = ${itemId} LIMIT 1
      `;
      updatedItem = Array.isArray(rawItem) && rawItem[0] ? rawItem[0] as GalleryItem : existingItem;
    }

    res.json({
      status: 'SUCCESS',
      message: 'Gallery item updated successfully',
      data: { item: updatedItem }
    });
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update gallery item'
    });
  }
};

/**
 * Delete a gallery item
 */
export const deleteGalleryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    
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

    // Check if gallery item exists and belongs to user
    let existingItem: GalleryItem | null = null;
    try {
      existingItem = await prisma.gallery.findFirst({
        where: {
          id: itemId,
          profileId: profile.id
        }
      });
    } catch (error) {
      // Fallback to raw query
      const rawItem = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "id" = ${itemId} AND "profileId" = ${profile.id}
        LIMIT 1
      `;
      existingItem = Array.isArray(rawItem) && rawItem[0] ? rawItem[0] as GalleryItem : null;
    }

    if (!existingItem) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Gallery item not found'
      });
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(existingItem.publicId);
    } catch (cloudinaryError) {
      console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete gallery item from database
    try {
      await prisma.gallery.delete({
        where: { id: itemId }
      });
    } catch (error) {
      // Fallback to raw query
      await prisma.$executeRaw`
        DELETE FROM "gallery_items" WHERE "id" = ${itemId}
      `;
    }

    // Reorder remaining items
    try {
      const remainingItems = await prisma.gallery.findMany({
        where: { profileId: profile.id },
        orderBy: { order: 'asc' }
      });

      await Promise.all(
        remainingItems.map((item, index) =>
          prisma.gallery.update({
            where: { id: item.id },
            data: { order: index }
          })
        )
      );
    } catch (error) {
      // Fallback reordering with raw query
      console.error('Error reordering with Prisma, using raw query:', error);
      const remainingItems = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "profileId" = ${profile.id} 
        ORDER BY "order" ASC
      `;
      
      if (Array.isArray(remainingItems)) {
        for (let i = 0; i < remainingItems.length; i++) {
          await prisma.$executeRaw`
            UPDATE "gallery_items" 
            SET "order" = ${i}, "updatedAt" = NOW()
            WHERE "id" = ${remainingItems[i].id}
          `;
        }
      }
    }

    res.json({
      status: 'SUCCESS',
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete gallery item'
    });
  }
};

/**
 * Reorder gallery items
 */
export const reorderGalleryItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemOrders } = req.body; // Array of {id, order}
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!Array.isArray(itemOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'itemOrders must be an array'
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

    // Update order for each item
    try {
      await Promise.all(
        itemOrders.map(({ id, order }) =>
          prisma.gallery.updateMany({
            where: {
              id,
              profileId: profile.id
            },
            data: { order }
          })
        )
      );
    } catch (error) {
      // Fallback to raw query
      console.error('Error reordering with Prisma, using raw query:', error);
      for (const { id, order } of itemOrders) {
        await prisma.$executeRaw`
          UPDATE "gallery_items" 
          SET "order" = ${order}, "updatedAt" = NOW()
          WHERE "id" = ${id} AND "profileId" = ${profile.id}
        `;
      }
    }

    // Get updated items
    let items: GalleryItem[] = [];
    try {
      items = await prisma.gallery.findMany({
        where: { profileId: profile.id },
        orderBy: { order: 'asc' }
      });
    } catch (error) {
      // Fallback to raw query
      const rawItems = await prisma.$queryRaw`
        SELECT * FROM "gallery_items" 
        WHERE "profileId" = ${profile.id} 
        ORDER BY "order" ASC
      `;
      items = Array.isArray(rawItems) ? rawItems as GalleryItem[] : [];
    }

    res.json({
      status: 'SUCCESS',
      message: 'Gallery items reordered successfully',
      data: { items }
    });
  } catch (error) {
    console.error('Reorder gallery items error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder gallery items'
    });
  }
};
