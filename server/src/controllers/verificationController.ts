import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import cloudinary from '../config/cloudinary';

// Define types since they might not be available yet
type VerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
type VerificationType = 'IDENTITY' | 'BUSINESS' | 'SOCIAL' | 'CELEBRITY' | 'ORGANIZATION';

interface VerificationRequest {
  id: string;
  userId: string;
  requestType: VerificationType;
  status: VerificationStatus;
  submittedData: any;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get verification status for the current user
 */
export const getVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get user with verification data using raw query as fallback
    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          subscription: true,
          hasVerifiedBadge: true,
          verificationStatus: true,
          verificationSubmittedAt: true,
          verificationApprovedAt: true,
          verificationRejectedAt: true,
          verificationNotes: true
        }
      });
    } catch (error) {
      // Fallback to raw query if fields don't exist yet
      const rawUser = await prisma.$queryRaw`
        SELECT 
          id, 
          subscription,
          "hasVerifiedBadge",
          "verificationStatus",
          "verificationSubmittedAt",
          "verificationApprovedAt", 
          "verificationRejectedAt",
          "verificationNotes"
        FROM "users" 
        WHERE id = ${userId}
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

    // Get latest verification request using raw query
    let latestRequest: VerificationRequest | null = null;
    try {
      const rawRequests = await prisma.$queryRaw`
        SELECT * FROM "verification_requests" 
        WHERE "userId" = ${userId} 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `;
      latestRequest = Array.isArray(rawRequests) && rawRequests[0] ? rawRequests[0] as VerificationRequest : null;
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    res.json({
      status: 'SUCCESS',
      data: {
        user: {
          hasVerifiedBadge: user.hasVerifiedBadge || false,
          verificationStatus: user.verificationStatus || 'NONE',
          canApply: user.subscription === 'BLAZE',
          submittedAt: user.verificationSubmittedAt,
          approvedAt: user.verificationApprovedAt,
          rejectedAt: user.verificationRejectedAt,
          adminNotes: user.verificationNotes
        },
        latestRequest
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch verification status'
    });
  }
};

/**
 * Submit a verification request
 */
export const submitVerificationRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { verificationType, socialLinks, businessInfo, additionalInfo } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Check if user has BLAZE subscription
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

    if (user.subscription !== 'BLAZE') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Verification badge is only available for BLAZE tier subscribers'
      });
    }

    // Check verification status using raw query
    let verificationStatus = 'NONE';
    try {
      const statusResult = await prisma.$queryRaw`
        SELECT "verificationStatus" FROM "users" WHERE id = ${userId} LIMIT 1
      `;
      if (Array.isArray(statusResult) && statusResult[0]) {
        verificationStatus = statusResult[0].verificationStatus || 'NONE';
      }
    } catch (error) {
      console.log('Verification fields not available yet, proceeding...');
    }

    // Check if user already has a pending request
    if (verificationStatus === 'PENDING') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You already have a pending verification request'
      });
    }

    // Check if user already has verified badge
    if (verificationStatus === 'APPROVED') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You are already verified'
      });
    }

    // Validate verification type
    const validTypes = ['IDENTITY', 'BUSINESS', 'SOCIAL', 'CELEBRITY', 'ORGANIZATION'];
    if (!validTypes.includes(verificationType)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid verification type'
      });
    }

    // Upload documents to Cloudinary
    const uploadedDocuments: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sparklink/verification',
            resource_type: 'auto'
          });
          uploadedDocuments.push(result.secure_url);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
        }
      }
    }

    // Prepare submission data
    const submissionData = {
      verificationType,
      socialLinks: socialLinks || {},
      businessInfo: businessInfo || {},
      additionalInfo: additionalInfo || '',
      documents: uploadedDocuments,
      submittedAt: new Date().toISOString()
    };

    // Create verification request using raw query
    const requestId = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await prisma.$executeRaw`
        INSERT INTO "verification_requests" (
          "id", "userId", "requestType", "status", "submittedData", "submittedAt", "createdAt", "updatedAt"
        ) VALUES (
          ${requestId}, ${userId}, ${verificationType}, 'PENDING', ${JSON.stringify(submissionData)}, NOW(), NOW(), NOW()
        )
      `;
    } catch (error) {
      console.error('Error creating verification request:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Failed to create verification request'
      });
    }

    // Update user verification status using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "verificationStatus" = 'PENDING', 
            "verificationSubmittedAt" = NOW(),
            "verificationData" = ${JSON.stringify(submissionData)},
            "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Verification request submitted successfully',
      data: {
        requestId,
        status: 'PENDING',
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Submit verification request error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to submit verification request'
    });
  }
};

/**
 * Get verification requirements and guidelines
 */
export const getVerificationRequirements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requirements = {
      IDENTITY: {
        title: 'Identity Verification',
        description: 'Verify your identity as a real person',
        requirements: [
          'Government-issued photo ID (passport, driver\'s license, national ID)',
          'Clear, high-quality photos of the document',
          'Document must be valid and not expired',
          'Name on document must match your SparkLink profile name'
        ],
        documents: ['Photo ID (front)', 'Photo ID (back if applicable)'],
        processingTime: '2-5 business days'
      },
      BUSINESS: {
        title: 'Business Verification',
        description: 'Verify your business or organization',
        requirements: [
          'Business registration certificate',
          'Tax registration documents',
          'Proof of business address',
          'Your role/position in the business'
        ],
        documents: ['Business registration', 'Tax documents', 'Address proof'],
        processingTime: '3-7 business days'
      },
      SOCIAL: {
        title: 'Social Media Verification',
        description: 'Verify your social media presence',
        requirements: [
          'Minimum 10,000 followers on at least one platform',
          'Active and authentic social media accounts',
          'Link to your SparkLink profile from your social media bio',
          'Consistent branding across platforms'
        ],
        documents: ['Screenshots of follower counts', 'Social media links'],
        processingTime: '1-3 business days'
      },
      CELEBRITY: {
        title: 'Public Figure Verification',
        description: 'Verify your status as a public figure',
        requirements: [
          'Significant media coverage or public recognition',
          'Wikipedia page or notable online presence',
          'Professional achievements in your field',
          'News articles or interviews featuring you'
        ],
        documents: ['Media coverage links', 'Professional credentials'],
        processingTime: '5-10 business days'
      },
      ORGANIZATION: {
        title: 'Organization Verification',
        description: 'Verify your non-profit or organization',
        requirements: [
          'Official organization registration',
          'Non-profit status documentation (if applicable)',
          'Organization website with your information',
          'Your official role in the organization'
        ],
        documents: ['Registration certificate', 'Non-profit documents', 'Role verification'],
        processingTime: '3-7 business days'
      }
    };

    res.json({
      status: 'SUCCESS',
      data: {
        requirements,
        generalGuidelines: [
          'Only BLAZE tier subscribers can apply for verification',
          'All documents must be clear and legible',
          'Fake or manipulated documents will result in permanent ban',
          'Processing times are estimates and may vary',
          'You can resubmit if your request is rejected',
          'Verified status can be revoked if guidelines are violated'
        ]
      }
    });
  } catch (error) {
    console.error('Get verification requirements error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch verification requirements'
    });
  }
};

/**
 * Get verification request history
 */
export const getVerificationHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    let requests: any[] = [];
    try {
      const rawRequests = await prisma.$queryRaw`
        SELECT 
          id, "requestType", status, "submittedAt", "reviewedAt", "reviewNotes", "createdAt"
        FROM "verification_requests" 
        WHERE "userId" = ${userId} 
        ORDER BY "createdAt" DESC
      `;
      requests = Array.isArray(rawRequests) ? rawRequests : [];
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    res.json({
      status: 'SUCCESS',
      data: { requests }
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch verification history'
    });
  }
};

/**
 * Cancel pending verification request
 */
export const cancelVerificationRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { requestId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Find the request using raw query
    let request: any = null;
    try {
      const rawRequest = await prisma.$queryRaw`
        SELECT * FROM "verification_requests" 
        WHERE id = ${requestId} AND "userId" = ${userId} AND status = 'PENDING'
        LIMIT 1
      `;
      request = Array.isArray(rawRequest) && rawRequest[0] ? rawRequest[0] : null;
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    if (!request) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Pending verification request not found'
      });
    }

    // Update request status using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "verification_requests" 
        SET status = 'REJECTED', "reviewedAt" = NOW(), "reviewNotes" = 'Cancelled by user', "updatedAt" = NOW()
        WHERE id = ${requestId}
      `;
    } catch (error) {
      console.error('Error updating verification request:', error);
    }

    // Update user verification status using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "verificationStatus" = 'NONE', 
            "verificationRejectedAt" = NOW(),
            "verificationNotes" = 'Request cancelled by user',
            "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }

    res.json({
      status: 'SUCCESS',
      message: 'Verification request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel verification request error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to cancel verification request'
    });
  }
};

/**
 * Get all pending verification requests (Admin only)
 */
export const getPendingVerifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real app, you'd check if the user is an admin
    let requests: any[] = [];
    
    try {
      const rawRequests = await prisma.$queryRaw`
        SELECT 
          vr.*,
          u.id as user_id,
          u.email as user_email,
          u."firstName" as user_firstName,
          u."lastName" as user_lastName,
          u.username as user_username,
          u.subscription as user_subscription
        FROM "verification_requests" vr
        INNER JOIN "users" u ON vr."userId" = u.id
        WHERE vr.status = 'PENDING'
        ORDER BY vr."submittedAt" ASC
      `;
      
      requests = Array.isArray(rawRequests) ? rawRequests.map((req: any) => ({
        id: req.id,
        userId: req.userId,
        requestType: req.requestType,
        status: req.status,
        submittedData: req.submittedData,
        submittedAt: req.submittedAt,
        reviewedAt: req.reviewedAt,
        reviewedBy: req.reviewedBy,
        reviewNotes: req.reviewNotes,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.user_id,
          email: req.user_email,
          firstName: req.user_firstName,
          lastName: req.user_lastName,
          username: req.user_username,
          subscription: req.user_subscription
        }
      })) : [];
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    res.json({
      status: 'SUCCESS',
      data: { requests }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch pending verifications'
    });
  }
};

/**
 * Approve verification request (Admin only)
 */
export const approveVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    
    // Find the request using raw query
    let request: any = null;
    try {
      const rawRequest = await prisma.$queryRaw`
        SELECT * FROM "verification_requests" 
        WHERE id = ${requestId} AND status = 'PENDING'
        LIMIT 1
      `;
      request = Array.isArray(rawRequest) && rawRequest[0] ? rawRequest[0] : null;
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    if (!request) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Verification request not found or not pending'
      });
    }

    // Update request using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "verification_requests" 
        SET status = 'APPROVED', 
            "reviewedAt" = NOW(), 
            "reviewedBy" = ${req.user?.id}, 
            "reviewNotes" = ${notes || ''},
            "updatedAt" = NOW()
        WHERE id = ${requestId}
      `;
    } catch (error) {
      console.error('Error updating verification request:', error);
    }

    // Update user using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "hasVerifiedBadge" = true, 
            "verificationStatus" = 'APPROVED',
            "verificationApprovedAt" = NOW(),
            "verificationNotes" = ${notes || ''},
            "updatedAt" = NOW()
        WHERE id = ${request.userId}
      `;
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }

    res.json({
      status: 'SUCCESS',
      message: 'Verification request approved successfully'
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to approve verification'
    });
  }
};

/**
 * Reject verification request (Admin only)
 */
export const rejectVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Rejection reason is required'
      });
    }

    // Find the request using raw query
    let request: any = null;
    try {
      const rawRequest = await prisma.$queryRaw`
        SELECT * FROM "verification_requests" 
        WHERE id = ${requestId} AND status = 'PENDING'
        LIMIT 1
      `;
      request = Array.isArray(rawRequest) && rawRequest[0] ? rawRequest[0] : null;
    } catch (error) {
      console.log('Verification requests table not available yet');
    }

    if (!request) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Verification request not found or not pending'
      });
    }

    // Update request using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "verification_requests" 
        SET status = 'REJECTED', 
            "reviewedAt" = NOW(), 
            "reviewedBy" = ${req.user?.id}, 
            "reviewNotes" = ${reason},
            "updatedAt" = NOW()
        WHERE id = ${requestId}
      `;
    } catch (error) {
      console.error('Error updating verification request:', error);
    }

    // Update user using raw query
    try {
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "verificationStatus" = 'REJECTED',
            "verificationRejectedAt" = NOW(),
            "verificationNotes" = ${reason},
            "updatedAt" = NOW()
        WHERE id = ${request.userId}
      `;
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }

    res.json({
      status: 'SUCCESS',
      message: 'Verification request rejected'
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reject verification'
    });
  }
};
