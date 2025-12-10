const ToyModel = require('../models/ToyModel');
const TransactionModel = require('../models/TransactionModel');
const ReviewModel = require('../models/ReviewModel');
const UserModel = require('../models/UserModel');

const AnalyticsService = {
    getShopAnalytics: async (shopOwnerEmail) => {
        try {
            // Get all shop toys
            const shopToys = await ToyModel.findBySeller(shopOwnerEmail);
            const shopToysList = shopToys.filter(t => t.type === 'shop_toy');

            // Get sales transactions
            const transactions = await TransactionModel.findByUser(shopOwnerEmail);
            const sales = transactions.filter(t => t.type === 'purchase' && t.currency === 'money');

            // Calculate metrics
            const totalToysListed = shopToysList.length;
            const soldToys = shopToysList.filter(t => t.status === 'sold').length;
            const availableToys = shopToysList.filter(t => t.status === 'available').length;

            // Revenue calculations
            const totalMoneyRevenue = sales
                .filter(t => t.currency === 'money')
                .reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);

            // Get reviews
            const reviews = await ReviewModel.findByShopOwner(shopOwnerEmail);
            const averageRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            // Most popular toys (by purchase count)
            const toySalesCount = {};
            sales.forEach(sale => {
                if (sale.toyId) {
                    toySalesCount[sale.toyId] = (toySalesCount[sale.toyId] || 0) + 1;
                }
            });

            const popularToys = Object.entries(toySalesCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([toyId, count]) => {
                    const toy = shopToysList.find(t => t._id.toString() === toyId);
                    return toy ? { ...toy, salesCount: count } : null;
                })
                .filter(Boolean);

            // Recent sales (last 10)
            const recentSales = sales
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            // Sales trends (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentSalesFiltered = sales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
            
            // Daily sales trend
            const dailySales = {};
            recentSalesFiltered.forEach(sale => {
                const date = new Date(sale.createdAt).toISOString().split('T')[0];
                dailySales[date] = (dailySales[date] || 0) + 1;
            });

            // Revenue trends
            const dailyRevenue = {};
            recentSalesFiltered.forEach(sale => {
                const date = new Date(sale.createdAt).toISOString().split('T')[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + (sale.amount || 0);
            });

            // Category performance
            const categorySales = {};
            shopToysList.forEach(toy => {
                const category = toy.subcategory || toy.sub_category || 'other';
                const toySales = sales.filter(s => s.toyId?.toString() === toy._id.toString());
                categorySales[category] = {
                    count: (categorySales[category]?.count || 0) + toySales.length,
                    revenue: (categorySales[category]?.revenue || 0) + 
                        toySales.reduce((sum, s) => sum + (s.amount || 0), 0)
                };
            });

            // Conversion rate
            const totalViews = shopToysList.reduce((sum, toy) => sum + (toy.viewCount || 0), 0);
            const conversionRate = totalViews > 0 ? (sales.length / totalViews * 100).toFixed(2) : 0;

            return {
                totalToysListed,
                soldToys,
                availableToys,
                totalMoneyRevenue,
                totalRevenue: totalMoneyRevenue,
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviews: reviews.length,
                popularToys,
                recentSales: recentSales.slice(0, 10),
                salesCount: sales.length,
                trends: {
                    dailySales,
                    dailyRevenue,
                    categoryPerformance: categorySales
                },
                conversionRate: parseFloat(conversionRate),
                totalViews
            };
        } catch (error) {
            console.error('Error getting shop analytics:', error);
            throw error;
        }
    },

    getSalesTrend: async (shopOwnerEmail, days = 30) => {
        try {
            const { getCollection } = require('../utils/db');
            const transactionsCollection = getCollection('transactions');
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Optimized aggregation pipeline - single query instead of multiple
            const salesTrend = await transactionsCollection.aggregate([
                {
                    $match: {
                        userEmail: shopOwnerEmail,
                        type: 'purchase',
                        currency: 'money',
                        amount: { $gt: 0 },
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: '$amount' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        count: 1,
                        revenue: 1
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]).toArray();

            return salesTrend;
        } catch (error) {
            console.error('Error getting sales trend:', error);
            throw error;
        }
    },

    getUserAnalytics: async (userEmail) => {
        try {
            const { getCollection } = require('../utils/db');
            const transactionsCollection = getCollection('transactions');
            
            // Optimized aggregation pipeline - single query instead of multiple
            const analytics = await transactionsCollection.aggregate([
                {
                    $match: {
                        userEmail: userEmail
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalAmount: { 
                            $sum: { 
                                $cond: [
                                    { $eq: ['$type', 'purchase'] },
                                    { $ifNull: ['$amount', 0] },
                                    0
                                ]
                            }
                        },
                        totalSaved: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$type', 'exchange'] },
                                    { $ifNull: ['$discountAmount', 0] },
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPurchases: {
                            $sum: {
                                $cond: [{ $eq: ['$_id', 'purchase'] }, '$count', 0]
                            }
                        },
                        totalExchanges: {
                            $sum: {
                                $cond: [{ $eq: ['$_id', 'exchange'] }, '$count', 0]
                            }
                        },
                        totalSpent: { $sum: '$totalAmount' },
                        totalSaved: { $sum: '$totalSaved' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalPurchases: { $ifNull: ['$totalPurchases', 0] },
                        totalExchanges: { $ifNull: ['$totalExchanges', 0] },
                        totalSpent: { $ifNull: ['$totalSpent', 0] },
                        totalSaved: { $ifNull: ['$totalSaved', 0] }
                    }
                }
            ]).toArray();

            return analytics[0] || {
                totalPurchases: 0,
                totalExchanges: 0,
                totalSpent: 0,
                totalSaved: 0
            };
        } catch (error) {
            console.error('Error getting user analytics:', error);
            throw error;
        }
    }
};

module.exports = AnalyticsService;

