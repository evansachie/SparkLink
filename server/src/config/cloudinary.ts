import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Type declaration for CloudinaryStorage params
interface CloudinaryStorageParams {
  cloudinary: typeof cloudinary;
  params: {
    folder: string;
    allowed_formats?: string[];
    transformation?: Array<Record<string, any>>;
    public_id?: (req: any, file: Express.Multer.File) => string;
  };
}

// Configure storage with proper typing
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sparklink',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req: any, file: Express.Multer.File) => {
      const userId = req.user?.id || 'anonymous';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `user-${userId}-${uniqueSuffix}`;
    }
  }
} as CloudinaryStorageParams);

// Configure storage with proper typing for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sparklink/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    public_id: (req: any, file: Express.Multer.File) => {
      const userId = req.user?.id || 'anonymous';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `gallery-${userId}-${uniqueSuffix}`;
    }
  }
} as CloudinaryStorageParams);

// Configure storage for resume uploads (PDF only)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sparklink/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    public_id: (req: any, file: Express.Multer.File) => {
      const userId = req.user?.id || 'anonymous';
      const uniqueSuffix = Date.now();
      return `resume-${userId}-${uniqueSuffix}`;
    }
  }
} as CloudinaryStorageParams);

// Create multer upload middleware
export const upload = multer({ storage });

// Create multer upload middleware for gallery
export const galleryUpload = multer({ 
  storage: galleryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create multer upload middleware for resumes
export const resumeUpload = multer({ 
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDF files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume upload'));
    }
  }
});

// Export cloudinary for direct operations
export default cloudinary;
