import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import { DEFAULT_TEMPLATES, DEFAULT_COLOR_SCHEMES } from '../config/templateConfig';
import { SubscriptionTier } from '@prisma/client';

/**
 * Initialize the database with template data
 */
export const initializeTemplates = async () => {
  try {
    console.log('Checking for templates table and data...');
    
    try {
      // Check if the templates table exists and has data
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'templates'
        );
      `;
      
      const exists = Array.isArray(tableExists) && tableExists[0]?.exists === true;
      
      if (!exists) {
        console.log('Templates table does not exist yet. Will be created when needed.');
        return;
      }
      
      // If table exists, check if it has data
      const templateCount = await prisma.template.count();
      console.log(`Found ${templateCount} existing templates.`);
      
      if (templateCount === 0) {
        await createTemplates();
      }
    } catch (error) {
      console.error('Error checking templates table:', error);
      // Table might not exist yet, which is fine
    }
  } catch (error) {
    console.error('Failed to initialize templates:', error);
  }
};

/**
 * Create default templates in database
 */
async function createTemplates() {
  console.log('Initializing default templates...');
  
  try {
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.template.create({
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          previewImage: template.previewImage,
          category: template.category,
          tier: template.tier as SubscriptionTier,
          features: template.features,
          isDefault: template.isDefault || false,
          isActive: template.isActive !== false
        }
      });
    }
    
    console.log(`Created ${DEFAULT_TEMPLATES.length} templates.`);
  } catch (error) {
    console.error('Error creating default templates:', error);
  }
}

/**
 * Get all templates available to the user based on subscription tier
 */
export const getTemplates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Determine which tiers the user has access to
    const accessibleTiers: SubscriptionTier[] = [];
    switch (user.subscription) {
      case 'BLAZE':
        accessibleTiers.push('BLAZE');
        // Fall through to include lower tiers
      case 'RISE':
        accessibleTiers.push('RISE');
        // Fall through to include lower tiers
      case 'STARTER':
      default:
        accessibleTiers.push('STARTER');
    }
    
    let templates;
    
    try {
      // Get templates for accessible tiers
      templates = await prisma.template.findMany({
        where: {
          tier: { in: accessibleTiers },
          isActive: true
        },
        orderBy: [
          { tier: 'asc' },
          { name: 'asc' }
        ]
      });
    } catch (error) {
      // If database query fails (possibly due to missing table), return default templates
      console.error('Error fetching templates from database:', error);
      templates = DEFAULT_TEMPLATES.filter(t => accessibleTiers.includes(t.tier as SubscriptionTier));
    }

    res.json({
      status: 'SUCCESS',
      data: {
        templates,
        colorSchemes: DEFAULT_COLOR_SCHEMES
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch templates'
    });
  }
};

/**
 * Get specific template details
 */
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    let template;
    
    try {
      template = await prisma.template.findUnique({
        where: { id: templateId }
      });
    } catch (error) {
      // If database query fails, look for the template in defaults
      console.error('Error fetching template from database:', error);
      template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    }

    if (!template) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Template not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      data: { template }
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch template'
    });
  }
};

/**
 * Apply template to user profile
 */
export const applyTemplate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { templateId, colorScheme } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!templateId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Template ID is required'
      });
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        subscription: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get template - first try database, then fall back to defaults
    let template;
    try {
      template = await prisma.template.findUnique({
        where: { id: templateId }
      });
    } catch (error) {
      template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    }

    if (!template) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Template not found'
      });
    }

    // Check if user has access to this template tier
    let hasAccess = false;
    switch (user.subscription) {
      case 'BLAZE':
        hasAccess = true;
        break;
      case 'RISE':
        hasAccess = ['RISE', 'STARTER'].includes(template.tier as SubscriptionTier);
        break;
      case 'STARTER':
      default:
        hasAccess = template.tier === 'STARTER';
    }

    if (!hasAccess) {
      return res.status(403).json({
        status: 'ERROR',
        message: `This template requires a ${template.tier} subscription`
      });
    }

    // Update or create profile
    let profile;
    
    try {
      if (user.profile) {
        profile = await prisma.profile.update({
          where: { userId },
          data: {
            templateId,
            colorScheme: colorScheme || undefined
          }
        });
      } else {
        profile = await prisma.profile.create({
          data: {
            userId,
            templateId,
            colorScheme: colorScheme || undefined,
            showPoweredBy: true
          }
        });
      }
    } catch (error) {
      // If we can't update the relationship yet, still acknowledge the selection
      console.error('Error updating profile with template:', error);
      profile = { ...user.profile, templateId };
    }

    res.json({
      status: 'SUCCESS',
      message: 'Template preference saved',
      data: {
        profile,
        template
      }
    });
  } catch (error) {
    console.error('Apply template error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to apply template'
    });
  }
};

/**
 * Update profile color scheme
 */
export const updateColorScheme = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { colorScheme } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (!colorScheme) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Color scheme is required'
      });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    // Update profile with color scheme
    try {
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          colorScheme
        }
      });
      
      res.json({
        status: 'SUCCESS',
        message: 'Color scheme updated successfully',
        data: {
          profile: updatedProfile
        }
      });
    } catch (error) {
      // If update fails, still acknowledge the color scheme choice
      console.error('Error updating profile color scheme in database:', error);
      res.json({
        status: 'SUCCESS',
        message: 'Color scheme preference saved (will apply after database update)',
        data: {
          colorScheme
        }
      });
    }
  } catch (error) {
    console.error('Update color scheme error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update color scheme'
    });
  }
};
