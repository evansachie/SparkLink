import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';

/**
 * Get overall analytics summary
 */
export const getAnalyticsSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get current date and 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Total profile views
    const totalProfileViews = await prisma.analytics.count({
      where: {
        userId,
        event: 'PROFILE_VIEW'
      }
    });

    // Last 30 days profile views
    const last30DaysProfileViews = await prisma.analytics.count({
      where: {
        userId,
        event: 'PROFILE_VIEW',
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    });

    // Total page views
    const totalPageViews = await prisma.analytics.count({
      where: {
        userId,
        event: 'PAGE_VIEW'
      }
    });

    // Last 30 days page views
    const last30DaysPageViews = await prisma.analytics.count({
      where: {
        userId,
        event: 'PAGE_VIEW',
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    });

    // Most viewed pages
    const mostViewedPages = await prisma.$queryRaw`
      SELECT p.id, p.title, p.slug, count(*) as "viewCount"
      FROM "analytics" a
      JOIN "pages" p ON (a.data->>'pageId')::text = p.id::text
      WHERE a."userId" = ${userId}
      AND a.event = 'PAGE_VIEW'
      GROUP BY p.id, p.title, p.slug
      ORDER BY "viewCount" DESC
      LIMIT 5
    `;

    res.json({
      status: 'SUCCESS',
      data: {
        totalProfileViews,
        last30DaysProfileViews,
        totalPageViews,
        last30DaysPageViews,
        mostViewedPages
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch analytics summary'
    });
  }
};

/**
 * Get daily visitor trends
 */
export const getVisitorTrends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Get period (default 30 days)
    const days = Number(req.query.days) || 30;
    if (days <= 0 || days > 365) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Days parameter must be between 1 and 365'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily profile views
    const profileViewsByDay = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") as "date", COUNT(*) as "count"
      FROM "analytics"
      WHERE "userId" = ${userId}
      AND event = 'PROFILE_VIEW'
      AND "createdAt" >= ${startDate}
      AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC
    `;

    // Get daily page views
    const pageViewsByDay = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") as "date", COUNT(*) as "count"
      FROM "analytics"
      WHERE "userId" = ${userId}
      AND event = 'PAGE_VIEW'
      AND "createdAt" >= ${startDate}
      AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC
    `;

    res.json({
      status: 'SUCCESS',
      data: {
        profileViewsByDay,
        pageViewsByDay,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Visitor trends error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch visitor trends'
    });
  }
};

/**
 * Get geographical distribution of visitors
 */
export const getGeoDistribution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // For now, we'll return dummy data as IP geolocation would require additional services
    // In a production environment, you would use MaxMind GeoIP or similar
    const geoDistribution = [
      { country: 'Ghana', count: 120, percentage: 45 },
      { country: 'United States', count: 80, percentage: 30 },
      { country: 'United Kingdom', count: 30, percentage: 11 },
      { country: 'Nigeria', count: 20, percentage: 7 },
      { country: 'Other', count: 18, percentage: 7 }
    ];

    res.json({
      status: 'SUCCESS',
      data: {
        geoDistribution
      },
      note: "This is sample data. Integration with actual IP geolocation service pending."
    });
  } catch (error) {
    console.error('Geo distribution error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch geographical distribution'
    });
  }
};

/**
 * Get device and browser stats
 */
export const getDeviceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }
    
    // For now, we'll return sample data since detailed parsing would require
    // a user agent parser library like ua-parser-js
    const deviceStats = {
      devices: [
        { name: 'Desktop', count: 180, percentage: 65 },
        { name: 'Mobile', count: 80, percentage: 29 },
        { name: 'Tablet', count: 16, percentage: 6 }
      ],
      browsers: [
        { name: 'Chrome', count: 160, percentage: 58 },
        { name: 'Safari', count: 60, percentage: 22 },
        { name: 'Firefox', count: 28, percentage: 10 },
        { name: 'Edge', count: 20, percentage: 7 },
        { name: 'Other', count: 8, percentage: 3 }
      ]
    };

    res.json({
      status: 'SUCCESS',
      data: deviceStats,
      note: "This is sample data. Integration with actual user agent parser pending."
    });
  } catch (error) {
    console.error('Device stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch device statistics'
    });
  }
};
