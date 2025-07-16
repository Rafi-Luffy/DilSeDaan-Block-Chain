import { Request, Response } from 'express';
import { Campaign } from '../models/Campaign';
import { Donation } from '../models/Donation';
import { User } from '../models/User';

export interface AnalyticsData {
    overview: {
        totalDonations: number;
        totalDonors: number;
        activeCampaigns: number;
        totalAmount: number;
        avgDonationAmount: number;
        growthRate: number;
    };
    campaignMetrics: {
        topCampaigns: Array<{
            id: string;
            title: string;
            raised: number;
            target: number;
            donorCount: number;
            completionRate: number;
        }>;
        categoryBreakdown: Array<{
            category: string;
            count: number;
            totalRaised: number;
            percentage: number;
        }>;
    };
    donorAnalytics: {
        donorSegments: Array<{
            segment: string;
            count: number;
            avgDonation: number;
            totalContribution: number;
        }>;
        retentionRate: number;
        geographicDistribution: Array<{
            state: string;
            donorCount: number;
            totalDonations: number;
        }>;
    };
    temporalTrends: {
        dailyDonations: Array<{
            date: string;
            amount: number;
            count: number;
        }>;
        monthlyTrends: Array<{
            month: string;
            amount: number;
            campaigns: number;
            donors: number;
        }>;
        hourlyPatterns: Array<{
            hour: number;
            donationCount: number;
            avgAmount: number;
        }>;
    };
    performanceMetrics: {
        conversionRate: number;
        averageTimeToFirstDonation: number;
        campaignSuccessRate: number;
        platformFeeCollected: number;
        refundRate: number;
    };
}

export class AdvancedAnalyticsService {
    
    // Get comprehensive analytics dashboard data
    async getDashboardAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        const [
            overview,
            campaignMetrics,
            donorAnalytics,
            temporalTrends,
            performanceMetrics
        ] = await Promise.all([
            this.getOverviewMetrics(startDate, endDate),
            this.getCampaignMetrics(startDate, endDate),
            this.getDonorAnalytics(startDate, endDate),
            this.getTemporalTrends(startDate, endDate),
            this.getPerformanceMetrics(startDate, endDate)
        ]);

        return {
            overview,
            campaignMetrics,
            donorAnalytics,
            temporalTrends,
            performanceMetrics
        };
    }

    private async getOverviewMetrics(startDate: Date, endDate: Date) {
        const [
            totalDonations,
            totalDonors,
            activeCampaigns,
            donationStats,
            previousPeriodStats
        ] = await Promise.all([
            Donation.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'completed'
            }),
            Donation.distinct('donorId', {
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'completed'
            }).then(donors => donors.length),
            Campaign.countDocuments({
                status: 'active',
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            Donation.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ]),
            this.getPreviousPeriodStats(startDate, endDate)
        ]);

        const totalAmount = donationStats[0]?.totalAmount || 0;
        const avgDonationAmount = donationStats[0]?.avgAmount || 0;
        
        const growthRate = previousPeriodStats.totalAmount > 0 
            ? ((totalAmount - previousPeriodStats.totalAmount) / previousPeriodStats.totalAmount) * 100
            : 0;

        return {
            totalDonations,
            totalDonors,
            activeCampaigns,
            totalAmount,
            avgDonationAmount,
            growthRate
        };
    }

    private async getCampaignMetrics(startDate: Date, endDate: Date) {
        // Top performing campaigns
        const topCampaigns = await Campaign.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'donations',
                    localField: '_id',
                    foreignField: 'campaignId',
                    as: 'donations'
                }
            },
            {
                $addFields: {
                    raised: { 
                        $sum: {
                            $map: {
                                input: '$donations',
                                as: 'donation',
                                in: { $cond: [{ $eq: ['$$donation.status', 'completed'] }, '$$donation.amount', 0] }
                            }
                        }
                    },
                    donorCount: { 
                        $size: {
                            $setUnion: [
                                {
                                    $map: {
                                        input: { $filter: { input: '$donations', cond: { $eq: ['$$this.status', 'completed'] } } },
                                        as: 'donation',
                                        in: '$$donation.donorId'
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    completionRate: { $multiply: [{ $divide: ['$raised', '$targetAmount'] }, 100] }
                }
            },
            { $sort: { raised: -1 } },
            { $limit: 10 },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    raised: 1,
                    target: '$targetAmount',
                    donorCount: 1,
                    completionRate: 1
                }
            }
        ]);

        // Category breakdown
        const categoryBreakdown = await Campaign.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'donations',
                    localField: '_id',
                    foreignField: 'campaignId',
                    as: 'donations'
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalRaised: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: '$donations',
                                    as: 'donation',
                                    in: { $cond: [{ $eq: ['$$donation.status', 'completed'] }, '$$donation.amount', 0] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    totalRaised: 1,
                    _id: 0
                }
            }
        ]);

        // Calculate percentages
        const totalRaisedAll = categoryBreakdown.reduce((sum, cat) => sum + cat.totalRaised, 0);
        const categoryBreakdownWithPercentage = categoryBreakdown.map(cat => ({
            ...cat,
            percentage: totalRaisedAll > 0 ? (cat.totalRaised / totalRaisedAll) * 100 : 0
        }));

        return {
            topCampaigns,
            categoryBreakdown: categoryBreakdownWithPercentage
        };
    }

    private async getDonorAnalytics(startDate: Date, endDate: Date) {
        // Donor segments based on donation amount
        const donorSegments = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$donorId',
                    totalDonated: { $sum: '$amount' },
                    donationCount: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    segment: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$totalDonated', 100000] }, then: 'Major Donor' },
                                { case: { $gte: ['$totalDonated', 25000] }, then: 'Significant Donor' },
                                { case: { $gte: ['$totalDonated', 5000] }, then: 'Regular Donor' },
                                { case: { $gte: ['$totalDonated', 1000] }, then: 'Occasional Donor' }
                            ],
                            default: 'First-time Donor'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    totalContribution: { $sum: '$totalDonated' },
                    avgDonation: { $avg: '$totalDonated' }
                }
            },
            {
                $project: {
                    segment: '$_id',
                    count: 1,
                    avgDonation: 1,
                    totalContribution: 1,
                    _id: 0
                }
            }
        ]);

        // Geographic distribution (placeholder - would require address data)
        const geographicDistribution = [
            { state: 'Maharashtra', donorCount: 450, totalDonations: 125000 },
            { state: 'Delhi', donorCount: 380, totalDonations: 98000 },
            { state: 'Karnataka', donorCount: 320, totalDonations: 87000 },
            { state: 'Tamil Nadu', donorCount: 290, totalDonations: 76000 },
            { state: 'Gujarat', donorCount: 240, totalDonations: 65000 }
        ];

        // Calculate retention rate (simplified)
        const retentionRate = await this.calculateRetentionRate(startDate, endDate);

        return {
            donorSegments,
            retentionRate,
            geographicDistribution
        };
    }

    private async getTemporalTrends(startDate: Date, endDate: Date) {
        // Daily donations
        const dailyDonations = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: '$_id',
                    amount: 1,
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Monthly trends
        const monthlyTrends = await Promise.all([
            this.getMonthlyDonationTrends(startDate, endDate),
            this.getMonthlyCampaignTrends(startDate, endDate),
            this.getMonthlyDonorTrends(startDate, endDate)
        ]).then(([donations, campaigns, donors]) => {
            // Combine the data
            const monthMap = new Map();
            
            donations.forEach(d => {
                monthMap.set(d.month, { ...d, campaigns: 0, donors: 0 });
            });
            
            campaigns.forEach(c => {
                const existing = monthMap.get(c.month) || { month: c.month, amount: 0 };
                monthMap.set(c.month, { ...existing, campaigns: c.count });
            });
            
            donors.forEach(d => {
                const existing = monthMap.get(d.month) || { month: d.month, amount: 0, campaigns: 0 };
                monthMap.set(d.month, { ...existing, donors: d.count });
            });
            
            return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
        });

        // Hourly patterns
        const hourlyPatterns = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    donationCount: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    hour: '$_id',
                    donationCount: 1,
                    avgAmount: { $divide: ['$totalAmount', '$donationCount'] },
                    _id: 0
                }
            },
            { $sort: { hour: 1 } }
        ]);

        return {
            dailyDonations,
            monthlyTrends,
            hourlyPatterns
        };
    }

    private async getPerformanceMetrics(startDate: Date, endDate: Date) {
        // These would be calculated based on various factors
        // For now, providing estimated values
        const conversionRate = 3.2; // Percentage of visitors who donate
        const averageTimeToFirstDonation = 2.5; // Days
        const campaignSuccessRate = 68; // Percentage of campaigns reaching target
        
        const platformFeeCollected = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalFees: { $sum: '$platformFee' }
                }
            }
        ]).then(result => result[0]?.totalFees || 0);

        const refundRate = 0.8; // Percentage of donations that were refunded

        return {
            conversionRate,
            averageTimeToFirstDonation,
            campaignSuccessRate,
            platformFeeCollected,
            refundRate
        };
    }

    private async getPreviousPeriodStats(startDate: Date, endDate: Date) {
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(startDate.getTime());

        const stats = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousStartDate, $lte: previousEndDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            totalAmount: stats[0]?.totalAmount || 0,
            count: stats[0]?.count || 0
        };
    }

    private async calculateRetentionRate(startDate: Date, endDate: Date): Promise<number> {
        // Calculate what percentage of donors from previous period donated again
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(startDate.getTime());

        const [previousDonors, currentDonors] = await Promise.all([
            Donation.distinct('donorId', {
                createdAt: { $gte: previousStartDate, $lte: previousEndDate },
                status: 'completed'
            }),
            Donation.distinct('donorId', {
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'completed'
            })
        ]);

        const repeatDonors = previousDonors.filter(donorId => 
            currentDonors.includes(donorId)
        );

        return previousDonors.length > 0 
            ? (repeatDonors.length / previousDonors.length) * 100 
            : 0;
    }

    private async getMonthlyDonationTrends(startDate: Date, endDate: Date) {
        return await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { format: '%Y-%m', date: '$createdAt' }
                    },
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: '$_id',
                    amount: 1,
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);
    }

    private async getMonthlyCampaignTrends(startDate: Date, endDate: Date) {
        return await Campaign.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { format: '%Y-%m', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);
    }

    private async getMonthlyDonorTrends(startDate: Date, endDate: Date) {
        return await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        donorId: '$donorId'
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.month',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);
    }

    // Export analytics data
    async exportAnalyticsReport(
        timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
        format: 'json' | 'csv' | 'pdf' = 'json'
    ): Promise<string | Buffer> {
        const analytics = await this.getDashboardAnalytics(timeRange);
        
        switch (format) {
            case 'json':
                return JSON.stringify(analytics, null, 2);
            case 'csv':
                return this.convertToCSV([analytics]);
            case 'pdf':
                return this.generatePDFReport(analytics);
            default:
                return JSON.stringify(analytics, null, 2);
        }
    }

    // Additional methods needed for analytics routes
    async getCampaignAnalytics(campaignId: string, timeframe: string = '30d') {
        const startDate = this.getStartDateFromTimeframe(timeframe);
        const endDate = new Date();
        
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const donations = await Donation.find({
            campaignId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
        });

        const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);
        const donorCount = new Set(donations.map(d => d.donor.toString())).size;

        return {
            campaignId,
            title: campaign.title,
            totalRaised,
            targetAmount: campaign.targetAmount,
            donorCount,
            donationCount: donations.length,
            averageDonation: donations.length > 0 ? totalRaised / donations.length : 0,
            progress: (totalRaised / campaign.targetAmount) * 100,
            donations: donations.map(d => ({
                amount: d.amount,
                date: d.createdAt,
                donorId: d.donor
            }))
        };
    }

    async getDonorAnalyticsForUser(donorId: string, timeframe: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        const donations = await Donation.find({
            donorId,
            createdAt: { $gte: timeframe },
            status: 'completed'
        }).populate('campaignId', 'title');

        const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
        const campaigns = new Set(donations.map(d => d.campaignId)).size;

        return {
            donorId,
            totalDonated,
            donationCount: donations.length,
            campaignsSupported: campaigns,
            averageDonation: donations.length > 0 ? totalDonated / donations.length : 0,
            firstDonation: donations.length > 0 ? donations[donations.length - 1].createdAt : null,
            lastDonation: donations.length > 0 ? donations[0].createdAt : null,
            donations: donations.map(d => ({
                amount: d.amount,
                date: d.createdAt,
                campaign: d.campaignId
            }))
        };
    }

    async exportCampaignData(timeframe: string = '30d') {
        const startDate = this.getStartDateFromTimeframe(timeframe);
        const endDate = new Date();
        
        return await Campaign.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('createdBy', 'name email');
    }

    async exportDonationData(timeframe: string = '30d') {
        const startDate = this.getStartDateFromTimeframe(timeframe);
        const endDate = new Date();
        
        return await Donation.find({
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
        }).populate('campaignId', 'title').populate('donorId', 'name email');
    }

    async exportUserData(timeframe: string = '30d') {
        const startDate = this.getStartDateFromTimeframe(timeframe);
        const endDate = new Date();
        
        return await User.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).select('-password -twoFactorSecret');
    }

    async exportData(data: any, format: string) {
        switch (format) {
            case 'json':
                return { data, filename: `export_${Date.now()}.json`, contentType: 'application/json' };
            case 'csv':
                // Simple CSV conversion - in production, use a proper CSV library
                const csv = this.convertToCSV(data);
                return { data: csv, filename: `export_${Date.now()}.csv`, contentType: 'text/csv' };
            default:
                throw new Error('Unsupported export format');
        }
    }

    async getRealTimeMetrics() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const [todayDonations, recentDonations, activeCampaigns] = await Promise.all([
            Donation.find({
                createdAt: { $gte: today },
                status: 'completed'
            }),
            Donation.find({
                status: 'completed'
            }).sort({ createdAt: -1 }).limit(10).populate('campaignId', 'title'),
            Campaign.countDocuments({ status: 'active' })
        ]);

        const todayTotal = todayDonations.reduce((sum, d) => sum + d.amount, 0);

        return {
            todayTotal,
            todayCount: todayDonations.length,
            recentDonations,
            activeCampaigns,
            lastUpdated: new Date()
        };
    }

    async getPerformanceMetricsForUser(timeframe: string = '30d', metric: string = 'overview') {
        const startDate = this.getStartDateFromTimeframe(timeframe);
        const endDate = new Date();

        return await this.getOverviewMetrics(startDate, endDate);
    }

    private getStartDateFromTimeframe(timeframe: string): Date {
        const now = new Date();
        switch (timeframe) {
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case '1y':
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    private convertToCSV(data: any[]): string {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    private generatePDFReport(analytics: AnalyticsData): Buffer {
        // This would use a library like puppeteer or jsPDF
        // For now, returning a placeholder
        return Buffer.from(`PDF Report would contain analytics data: ${JSON.stringify(analytics.overview)}`);
    }
}

// API Controller
export const getAnalyticsDashboard = async (req: Request, res: Response) => {
    try {
        const { timeRange = '30d' } = req.query;
        const analyticsService = new AdvancedAnalyticsService();
        
        const analytics = await analyticsService.getDashboardAnalytics(
            timeRange as '7d' | '30d' | '90d' | '1y'
        );
        
        res.json({
            success: true,
            data: analytics,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate analytics dashboard',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const exportAnalytics = async (req: Request, res: Response) => {
    try {
        const { timeRange = '30d', format = 'json' } = req.query;
        const analyticsService = new AdvancedAnalyticsService();
        
        const report = await analyticsService.exportAnalyticsReport(
            timeRange as '7d' | '30d' | '90d' | '1y',
            format as 'json' | 'csv' | 'pdf'
        );
        
        switch (format) {
            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.csv`);
                break;
            case 'pdf':
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.pdf`);
                break;
            default:
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}.json`);
        }
        
        res.send(report);
    } catch (error) {
        console.error('Analytics export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export analytics report',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const advancedAnalyticsService = new AdvancedAnalyticsService();
