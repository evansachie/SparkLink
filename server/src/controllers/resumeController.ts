import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import cloudinary from '../config/cloudinary';

/**
 * Upload resume PDF
 */
export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
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
        message: 'Resume file is required'
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Only PDF files are allowed for resume upload'
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

    // Delete old resume from Cloudinary if exists
    if (profile.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(profile.resumePublicId, {
          resource_type: 'raw'
        });
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Upload new resume to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'sparklink/resumes',
      resource_type: 'raw',
      public_id: `resume-${userId}-${Date.now()}`,
      format: 'pdf'
    });

    // Update profile with resume information
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        resumeUrl: uploadResult.secure_url,
        resumePublicId: uploadResult.public_id,
        resumeFileName: file.originalname,
        resumeUploadedAt: new Date(),
        allowResumeDownload: true
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: updatedProfile.resumeUrl,
        resumeFileName: updatedProfile.resumeFileName,
        resumeUploadedAt: updatedProfile.resumeUploadedAt,
        allowResumeDownload: updatedProfile.allowResumeDownload
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to upload resume'
    });
  }
};

/**
 * Get resume information for authenticated user
 */
export const getResumeInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        resumeUrl: true,
        resumeFileName: true,
        resumeUploadedAt: true,
        allowResumeDownload: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      data: {
        hasResume: !!profile.resumeUrl,
        resumeFileName: profile.resumeFileName,
        resumeUploadedAt: profile.resumeUploadedAt,
        allowResumeDownload: profile.allowResumeDownload
      }
    });
  } catch (error) {
    console.error('Get resume info error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get resume information'
    });
  }
};

/**
 * Update resume download settings
 */
export const updateResumeSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { allowResumeDownload } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    if (typeof allowResumeDownload !== 'boolean') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'allowResumeDownload must be a boolean value'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    if (!profile.resumeUrl) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No resume uploaded yet'
      });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        allowResumeDownload
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Resume settings updated successfully',
      data: {
        allowResumeDownload: updatedProfile.allowResumeDownload
      }
    });
  } catch (error) {
    console.error('Update resume settings error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update resume settings'
    });
  }
};

/**
 * Delete resume
 */
export const deleteResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Profile not found'
      });
    }

    if (!profile.resumeUrl) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No resume to delete'
      });
    }

    // Delete from Cloudinary
    if (profile.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(profile.resumePublicId, {
          resource_type: 'raw'
        });
      } catch (error) {
        console.error('Error deleting resume from Cloudinary:', error);
      }
    }

    // Update profile to remove resume information
    await prisma.profile.update({
      where: { userId },
      data: {
        resumeUrl: null,
        resumePublicId: null,
        resumeFileName: null,
        resumeUploadedAt: null,
        allowResumeDownload: true
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete resume'
    });
  }
};

/**
 * Download resume (public endpoint)
 */
export const downloadResume = async (req: any, res: Response) => {
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

    // Get profile with resume information
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        resumeUrl: true,
        resumeFileName: true,
        allowResumeDownload: true,
        isPublished: true
      }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Profile not found or not published'
      });
    }

    if (!profile.resumeUrl) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No resume available for download'
      });
    }

    if (!profile.allowResumeDownload) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Resume download is not allowed'
      });
    }

    // Track resume download
    await trackResumeDownload(user.id, req);

    // Redirect to Cloudinary URL for download
    res.redirect(profile.resumeUrl);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to download resume'
    });
  }
};

/**
 * Get public resume info (for displaying download button)
 */
export const getPublicResumeInfo = async (req: any, res: Response) => {
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

    // Get profile with resume information
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        resumeFileName: true,
        resumeUploadedAt: true,
        allowResumeDownload: true,
        isPublished: true
      }
    });

    if (!profile || !profile.isPublished) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Profile not found or not published'
      });
    }

    res.json({
      status: 'SUCCESS',
      data: {
        hasResume: !!profile.resumeFileName && profile.allowResumeDownload,
        resumeFileName: profile.allowResumeDownload ? profile.resumeFileName : null,
        resumeUploadedAt: profile.allowResumeDownload ? profile.resumeUploadedAt : null
      }
    });
  } catch (error) {
    console.error('Get public resume info error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get resume information'
    });
  }
};

/**
 * Track resume download in analytics
 */
async function trackResumeDownload(userId: string, req: any): Promise<void> {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    await prisma.analytics.create({
      data: {
        userId,
        event: 'PROFILE_VIEW', // We can extend this to include RESUME_DOWNLOAD
        data: {
          action: 'RESUME_DOWNLOAD',
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to track resume download:', error);
    // Don't throw, just log error - this shouldn't block the response
  }
}

/**
 * Get client IP address from request object
 */
function getClientIp(req: any): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) 
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();
    return ips;
  }
  return req.socket.remoteAddress || '';
}
