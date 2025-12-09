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
            const transactions = await TransactionModel.findByUser(shopOwnerEmail);
            const sales = transactions.filter(t => 
                t.type === 'purchase' && t.currency === 'money' && t.amount > 0
            );

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const filteredSales = sales.filter(sale => 
                new Date(sale.createdAt) >= startDate
            );

            // Group by date
            const salesByDate = {};
            filteredSales.forEach(sale => {
                const date = new Date(sale.createdAt).toISOString().split('T')[0];
                if (!salesByDate[date]) {
                    salesByDate[date] = { date, count: 0, revenue: 0 };
                }
                salesByDate[date].count += 1;
                salesByDate[date].revenue += sale.amount;
            });

            return Object.values(salesByDate).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
        } catch (error) {
            console.error('Error getting sales trend:', error);
            throw error;
        }
    },

    getUserAnalytics: async (userEmail) => {
        try {
            const transactions = await TransactionModel.findByUser(userEmail);
            const purchases = transactions.filter(t => t.type === 'purchase');
            const exchanges = transactions.filter(t => t.type === 'exchange');
            
            return {
                totalPurchases: purchases.length,
                totalExchanges: exchanges.length,
                totalSpent: purchases.reduce((sum, t) => sum + (t.amount || 0), 0),
                totalSaved: exchanges.reduce((sum, t) => sum + (t.discountAmount || 0), 0)
            };
        } catch (error) {
            console.error('Error getting user analytics:', error);
            throw error;
        }
    }
};

module.exports = AnalyticsService;

