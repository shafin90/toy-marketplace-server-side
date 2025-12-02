const ReviewModel = require('../models/ReviewModel');
const UserModel = require('../models/UserModel');

const ReviewService = {
    createReview: async (reviewData) => {
        const review = {
            ...reviewData,
            rating: parseInt(reviewData.rating),
        };

        const result = await ReviewModel.create(review);

        // Update shop owner's average rating
        if (reviewData.shopOwnerEmail) {
            const avgRating = await ReviewModel.calculateAverageRating(reviewData.shopOwnerEmail);
            await UserModel.updateProfile(reviewData.shopOwnerEmail, {
                rating: avgRating,
                totalRatings: (await ReviewModel.findByShopOwner(reviewData.shopOwnerEmail)).length
            });
        }

        return result;
    },

    getReviewsByToy: async (toyId) => {
        return await ReviewModel.findByToy(toyId);
    },

    getReviewsByShopOwner: async (shopOwnerEmail) => {
        return await ReviewModel.findByShopOwner(shopOwnerEmail);
    },

    getReviewsByUser: async (userEmail) => {
        return await ReviewModel.findByUser(userEmail);
    },

    updateReview: async (reviewId, updateData) => {
        const result = await ReviewModel.update(reviewId, updateData);

        // Update shop owner rating if shop owner email exists
        const review = await ReviewModel.findById(reviewId);
        if (review && review.shopOwnerEmail) {
            const avgRating = await ReviewModel.calculateAverageRating(review.shopOwnerEmail);
            await UserModel.updateProfile(review.shopOwnerEmail, {
                rating: avgRating
            });
        }

        return result;
    },

    deleteReview: async (reviewId) => {
        return await ReviewModel.delete(reviewId);
    }
};

module.exports = ReviewService;

