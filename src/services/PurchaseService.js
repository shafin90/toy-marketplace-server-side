const ToyModel = require('../models/ToyModel');
const UserModel = require('../models/UserModel');
const TransactionModel = require('../models/TransactionModel');
const EmailService = require('./EmailService');
const PaymentService = require('./PaymentService');

const PurchaseService = {
    purchaseWithMoney: async (toyId, buyerEmail, paymentDetails) => {
        // Get toy
        const toy = await ToyModel.findById(toyId);
        if (!toy || toy.status !== 'available' || toy.type !== 'shop_toy') {
            throw new Error('Toy not available for purchase');
        }

        if (!toy.price || toy.price <= 0) {
            throw new Error('This toy cannot be purchased with money');
        }

        // Get buyer
        const buyer = await UserModel.findByEmail(buyerEmail);
        if (!buyer) {
            throw new Error('Buyer not found');
        }

        // Check if buyer is trying to buy their own toy
        if (toy.listedBy === buyerEmail) {
            throw new Error('You cannot purchase your own toy');
        }

        // Check available quantity
        const currentQuantity = toy.available_quantity || toy.quantity || 0;
        if (currentQuantity <= 0) {
            throw new Error('This toy is out of stock');
        }

        // Store current quantity for later use
        const toyQuantity = currentQuantity;

        // Handle payment based on payment method
        const paymentMethod = paymentDetails?.paymentMethod || 'stripe';

        if (paymentMethod === 'stripe') {
            // Create Stripe payment intent
            const paymentIntent = await PaymentService.createPaymentIntent(
                toy.price,
                'bdt', // Bangladeshi Taka
                {
                    toyId: toyId,
                    toyName: toy.name,
                    buyerEmail: buyerEmail,
                    shopOwnerEmail: toy.listedBy
                }
            );

            return {
                success: true,
                requiresPayment: true,
                paymentIntent: paymentIntent,
                message: 'Payment intent created. Complete payment to finalize purchase.'
            };
        } else if (paymentMethod === 'bkash') {
            // Create bKash payment
            const bkashPayment = await PaymentService.createBkashPayment(
                toy.price,
                paymentDetails.phone
            );

            return {
                success: true,
                requiresPayment: true,
                bkashPayment: bkashPayment,
                message: 'bKash payment initiated. Complete payment to finalize purchase.'
            };
        } else {
            // For other payment methods or direct payment confirmation
            // Atomically decrement quantity
            await ToyModel.decrementQuantity(toyId, 1);
            
            // Record purchase details
            await ToyModel.update(toyId, {
                purchasedBy: buyerEmail,
                purchasedAt: new Date(),
                purchaseMethod: 'money',
                purchaseAmount: toy.price
            });

            // Create transaction record
            await TransactionModel.create({
                type: 'purchase',
                userId: buyerEmail,
                toyId: toyId,
                amount: toy.price,
                currency: 'money',
                status: 'completed',
                description: `Purchased ${toy.name} with money`,
                paymentDetails: paymentDetails
            });

            // Send email notifications
            try {
                await EmailService.sendPurchaseConfirmation(buyerEmail, toy.name, 'money', toy.price);
                await EmailService.sendNewPurchaseNotification(toy.listedBy, toy.name, buyerEmail);
            } catch (emailError) {
                console.error('Email notification error:', emailError);
            }

            return {
                success: true,
                message: 'Purchase successful',
                paymentAmount: toy.price
            };
        }
    },

    confirmMoneyPurchase: async (toyId, buyerEmail, paymentIntentId) => {
        // Verify payment
        const paymentConfirmation = await PaymentService.confirmPayment(paymentIntentId);

        if (!paymentConfirmation.success) {
            throw new Error('Payment not confirmed');
        }

        // Get toy
        const toy = await ToyModel.findById(toyId);
        if (!toy) {
            throw new Error('Toy not found');
        }

        // Check available quantity
        const currentQuantity = toy.available_quantity || toy.quantity || 0;
        if (currentQuantity <= 0) {
            throw new Error('This toy is out of stock');
        }

        // Atomically decrement quantity
        await ToyModel.decrementQuantity(toyId, 1);
        
        // Record purchase details
        await ToyModel.update(toyId, {
            purchasedBy: buyerEmail,
            purchasedAt: new Date(),
            purchaseMethod: 'money',
            purchaseAmount: toy.price
        });

        // Create transaction record
        await TransactionModel.create({
            type: 'purchase',
            userId: buyerEmail,
            toyId: toyId,
            amount: toy.price,
            currency: 'money',
            status: 'completed',
            description: `Purchased ${toy.name} with money`,
            paymentDetails: { paymentIntentId, method: 'stripe' }
        });

        // Send email notifications
        try {
            await EmailService.sendPurchaseConfirmation(buyerEmail, toy.name, 'money', toy.price);
            await EmailService.sendNewPurchaseNotification(toy.listedBy, toy.name, buyerEmail);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return {
            success: true,
            message: 'Purchase confirmed and completed',
            paymentAmount: toy.price
        };
    }
};

module.exports = PurchaseService;

