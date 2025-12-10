const { getDB } = require('./db');

/**
 * Database Indexes Utility
 * Creates indexes for frequently queried fields to optimize query performance
 * 
 * Layer: Utility Layer (Data Access Optimization)
 */

const createIndexes = async () => {
    try {
        const db = getDB();
        
        // ========== TOYS COLLECTION INDEXES ==========
        const toysCollection = db.collection('toys');
        
        // Single field indexes
        await toysCollection.createIndex({ status: 1 });
        await toysCollection.createIndex({ type: 1 });
        await toysCollection.createIndex({ sellerEmail: 1 });
        await toysCollection.createIndex({ listedBy: 1 });
        await toysCollection.createIndex({ subcategory: 1 });
        await toysCollection.createIndex({ creditCost: 1 });
        await toysCollection.createIndex({ createdAt: -1 });
        await toysCollection.createIndex({ updatedAt: -1 });
        
        // Compound indexes for common query patterns
        // Query: Find available shop toys
        await toysCollection.createIndex({ status: 1, type: 1 });
        
        // Query: Find toys by seller with status
        await toysCollection.createIndex({ sellerEmail: 1, status: 1 });
        
        // Query: Filter by status, type, and sort by price
        await toysCollection.createIndex({ status: 1, type: 1, creditCost: 1 });
        
        // Query: Filter by category and price range
        await toysCollection.createIndex({ subcategory: 1, creditCost: 1 });
        
        // Query: Recent toys (sorted by createdAt)
        await toysCollection.createIndex({ status: 1, createdAt: -1 });
        
        // Text search index for name, description, brand
        // Note: Text indexes are not supported with apiStrict: true
        // Using try-catch to handle gracefully
        try {
            await toysCollection.createIndex({ 
                name: 'text', 
                description: 'text',
                brand: 'text'
            });
            console.log('✅ Text search index created');
        } catch (error) {
            // Text indexes not supported with apiStrict mode
            // App will still work, just without text search optimization
            console.log('⚠️  Text search index skipped (not supported with apiStrict mode)');
        }
        
        // Old toy queries
        await toysCollection.createIndex({ type: 1, status: 1, shopOwnerEmail: 1 });
        
        console.log('✅ Toys collection indexes created');

        // ========== USERS COLLECTION INDEXES ==========
        const usersCollection = db.collection('users');
        
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ role: 1 });
        await usersCollection.createIndex({ coins: 1 });
        await usersCollection.createIndex({ createdAt: -1 });
        
        console.log('✅ Users collection indexes created');

        // ========== TRANSACTIONS COLLECTION INDEXES ==========
        const transactionsCollection = db.collection('transactions');
        
        await transactionsCollection.createIndex({ userEmail: 1 });
        await transactionsCollection.createIndex({ toyId: 1 });
        await transactionsCollection.createIndex({ type: 1 });
        await transactionsCollection.createIndex({ createdAt: -1 });
        
        // Compound: User transactions sorted by date
        await transactionsCollection.createIndex({ userEmail: 1, createdAt: -1 });
        
        // Compound: Transaction type and date
        await transactionsCollection.createIndex({ type: 1, createdAt: -1 });
        
        console.log('✅ Transactions collection indexes created');

        // ========== REVIEWS COLLECTION INDEXES ==========
        const reviewsCollection = db.collection('reviews');
        
        await reviewsCollection.createIndex({ toyId: 1 });
        await reviewsCollection.createIndex({ shopOwnerEmail: 1 });
        await reviewsCollection.createIndex({ userEmail: 1 });
        await reviewsCollection.createIndex({ rating: 1 });
        await reviewsCollection.createIndex({ createdAt: -1 });
        
        // Compound: Shop reviews sorted by rating
        await reviewsCollection.createIndex({ shopOwnerEmail: 1, rating: -1 });
        
        console.log('✅ Reviews collection indexes created');

        // ========== CHAT COLLECTION INDEXES ==========
        const conversationsCollection = db.collection('conversations');
        
        await conversationsCollection.createIndex({ participants: 1 });
        await conversationsCollection.createIndex({ lastMessageAt: -1 });
        await conversationsCollection.createIndex({ 'participants.email': 1 });
        
        console.log('✅ Conversations collection indexes created');

        // ========== MESSAGES COLLECTION INDEXES ==========
        const messagesCollection = db.collection('messages');
        
        await messagesCollection.createIndex({ conversationId: 1 });
        await messagesCollection.createIndex({ senderEmail: 1 });
        await messagesCollection.createIndex({ createdAt: -1 });
        
        // Compound: Messages in conversation sorted by date
        await messagesCollection.createIndex({ conversationId: 1, createdAt: -1 });
        
        console.log('✅ Messages collection indexes created');

        // ========== WISHLIST COLLECTION INDEXES ==========
        const wishlistCollection = db.collection('wishlists');
        
        await wishlistCollection.createIndex({ userEmail: 1 });
        await wishlistCollection.createIndex({ toyId: 1 });
        await wishlistCollection.createIndex({ createdAt: -1 });
        
        // Compound: User wishlist with unique toy
        await wishlistCollection.createIndex({ userEmail: 1, toyId: 1 }, { unique: true });
        
        console.log('✅ Wishlist collection indexes created');

        // ========== NOTIFICATIONS COLLECTION INDEXES ==========
        const notificationsCollection = db.collection('notifications');
        
        await notificationsCollection.createIndex({ userEmail: 1 });
        await notificationsCollection.createIndex({ isRead: 1 });
        await notificationsCollection.createIndex({ createdAt: -1 });
        
        // Compound: Unread notifications for user
        await notificationsCollection.createIndex({ userEmail: 1, isRead: 1, createdAt: -1 });
        
        console.log('✅ Notifications collection indexes created');

        // ========== RECENTLY VIEWED COLLECTION INDEXES ==========
        const recentlyViewedCollection = db.collection('recently_viewed');
        
        await recentlyViewedCollection.createIndex({ userEmail: 1 });
        await recentlyViewedCollection.createIndex({ viewedAt: -1 });
        
        // Compound: User's recently viewed sorted by date
        await recentlyViewedCollection.createIndex({ userEmail: 1, viewedAt: -1 });
        
        console.log('✅ Recently viewed collection indexes created');

        // ========== PRICE ALERTS COLLECTION INDEXES ==========
        const priceAlertsCollection = db.collection('price_alerts');
        
        await priceAlertsCollection.createIndex({ userEmail: 1 });
        await priceAlertsCollection.createIndex({ toyId: 1 });
        await priceAlertsCollection.createIndex({ isActive: 1 });
        
        // Compound: Active alerts for user
        await priceAlertsCollection.createIndex({ userEmail: 1, isActive: 1 });
        
        console.log('✅ Price alerts collection indexes created');

        // ========== SHOP FOLLOW COLLECTION INDEXES ==========
        const shopFollowCollection = db.collection('shop_follows');
        
        await shopFollowCollection.createIndex({ userEmail: 1 });
        await shopFollowCollection.createIndex({ shopOwnerEmail: 1 });
        await shopFollowCollection.createIndex({ createdAt: -1 });
        
        // Compound: Unique follow relationship
        await shopFollowCollection.createIndex({ userEmail: 1, shopOwnerEmail: 1 }, { unique: true });
        
        console.log('✅ Shop follows collection indexes created');

        // ========== REFERRALS COLLECTION INDEXES ==========
        const referralsCollection = db.collection('referrals');
        
        await referralsCollection.createIndex({ referrerEmail: 1 });
        await referralsCollection.createIndex({ refereeEmail: 1 });
        await referralsCollection.createIndex({ referralCode: 1 }, { unique: true });
        await referralsCollection.createIndex({ createdAt: -1 });
        
        console.log('✅ Referrals collection indexes created');

        // ========== DELIVERIES COLLECTION INDEXES ==========
        const deliveriesCollection = db.collection('deliveries');
        
        await deliveriesCollection.createIndex({ exchangeId: 1 });
        await deliveriesCollection.createIndex({ userEmail: 1 });
        await deliveriesCollection.createIndex({ deliveryManEmail: 1 });
        await deliveriesCollection.createIndex({ status: 1 });
        await deliveriesCollection.createIndex({ createdAt: -1 });
        
        // Compound: User deliveries by status
        await deliveriesCollection.createIndex({ userEmail: 1, status: 1 });
        
        // Compound: Delivery man assignments
        await deliveriesCollection.createIndex({ deliveryManEmail: 1, status: 1 });
        
        console.log('✅ Deliveries collection indexes created');

        // ========== COLLECTIONS COLLECTION INDEXES ==========
        const collectionsCollection = db.collection('collections');
        
        await collectionsCollection.createIndex({ shopOwnerEmail: 1 });
        await collectionsCollection.createIndex({ createdAt: -1 });
        
        console.log('✅ Collections collection indexes created');

        // ========== EXCHANGE REQUESTS COLLECTION INDEXES ==========
        const exchangeRequestsCollection = db.collection('exchange_requests');
        
        await exchangeRequestsCollection.createIndex({ buyerEmail: 1 });
        await exchangeRequestsCollection.createIndex({ sellerEmail: 1 });
        await exchangeRequestsCollection.createIndex({ status: 1 });
        await exchangeRequestsCollection.createIndex({ createdAt: -1 });
        
        // Compound: User exchange requests by status
        await exchangeRequestsCollection.createIndex({ buyerEmail: 1, status: 1 });
        
        console.log('✅ Exchange requests collection indexes created');

        // ========== SHOPS COLLECTION INDEXES ==========
        const shopsCollection = db.collection('shops');
        
        // Use sparse: true to allow multiple null values while enforcing uniqueness for non-null values
        await shopsCollection.createIndex({ ownerEmail: 1 }, { unique: true, sparse: true });
        await shopsCollection.createIndex({ shopName: 1 });
        await shopsCollection.createIndex({ location: 1 });
        await shopsCollection.createIndex({ createdAt: -1 });
        
        console.log('✅ Shops collection indexes created');

        console.log('🎉 All database indexes created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        // Don't throw - indexes are optional optimizations
        // App should still work without them
    }
};

module.exports = { createIndexes };

