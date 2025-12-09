const ExchangeRequestModel = require('../models/ExchangeRequestModel');
const OldToyModel = require('../models/OldToyModel');
const ToyModel = require('../models/ToyModel');
const TransactionModel = require('../models/TransactionModel');
const EmailService = require('./EmailService');

const ExchangeService = {
    createExchangeRequest: async (exchangeData) => {
        const { productId, userId, oldToyIds } = exchangeData;

        // Validate product exists and allows exchange
        const product = await ToyModel.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (!product.allowOldToyExchange) {
            throw new Error('This product does not accept old toy exchange');
        }
        if (product.status !== 'available') {
            throw new Error('Product is not available');
        }

        // Validate old toys exist and belong to user
        const oldToys = await OldToyModel.findByIds(oldToyIds);
        if (oldToys.length !== oldToyIds.length) {
            throw new Error('Some old toys not found');
        }
        for (const oldToy of oldToys) {
            if (oldToy.listedBy !== userId) {
                throw new Error('You can only exchange your own old toys');
            }
            if (oldToy.status !== 'available') {
                throw new Error(`Old toy "${oldToy.name}" is not available for exchange`);
            }
        }

        // Create exchange request
        const exchangeRequest = await ExchangeRequestModel.create({
            productId: productId,
            userId: userId,
            shopOwnerEmail: product.listedBy,
            oldToys: oldToys.map(oldToy => ({
                oldToyId: oldToy._id,
                oldToyName: oldToy.name,
                discountAmount: 0, // Will be set by shop owner
                status: 'pending'
            })),
            originalPrice: product.price || 0,
            totalDiscount: 0,
            finalPrice: product.price || 0,
            status: 'pending_shop_owner'
        });

        // Send emails
        try {
            await EmailService.sendExchangeRequestNotification(userId, product.name, oldToys.length);
            await EmailService.sendExchangeRequestToShopOwner(product.listedBy, product.name, userId, oldToys.length);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return exchangeRequest;
    },

    getExchangeRequestsByShopOwner: async (shopOwnerEmail) => {
        const requests = await ExchangeRequestModel.findByShopOwner(shopOwnerEmail);
        
        // Populate product and old toy details
        for (const request of requests) {
            request.product = await ToyModel.findById(request.productId);
            request.oldToysDetails = await OldToyModel.findByIds(
                request.oldToys.map(ot => ot.oldToyId)
            );
        }
        
        return requests;
    },

    getExchangeRequestsByUser: async (userEmail) => {
        const requests = await ExchangeRequestModel.findByUser(userEmail);
        
        // Populate product details
        for (const request of requests) {
            request.product = await ToyModel.findById(request.productId);
        }
        
        return requests;
    },

    setDiscounts: async (exchangeId, shopOwnerEmail, discounts) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }
        if (exchange.shopOwnerEmail !== shopOwnerEmail) {
            throw new Error('You can only set discounts for your own shop requests');
        }
        if (exchange.status !== 'pending_shop_owner') {
            throw new Error('Discounts can only be set for pending requests');
        }

        // Update discounts
        let totalDiscount = 0;
        const updatedOldToys = exchange.oldToys.map(oldToy => {
            const discount = discounts.find(d => d.oldToyId.toString() === oldToy.oldToyId.toString());
            const discountAmount = discount ? discount.discountAmount : 0;
            totalDiscount += discountAmount;
            return {
                ...oldToy,
                discountAmount: discountAmount,
                status: discountAmount > 0 ? 'approved' : 'rejected'
            };
        });

        const finalPrice = Math.max(0, exchange.originalPrice - totalDiscount);

        // Update exchange request
        await ExchangeRequestModel.update(exchangeId, {
            oldToys: updatedOldToys,
            totalDiscount: totalDiscount,
            finalPrice: finalPrice,
            status: 'price_set'
        });

        // Send email to user
        try {
            await EmailService.sendExchangePriceSetNotification(
                exchange.userId,
                exchange.productId,
                finalPrice,
                exchange.originalPrice,
                totalDiscount
            );
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return await ExchangeRequestModel.findById(exchangeId);
    },

    userAcceptExchange: async (exchangeId, userEmail) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }
        if (exchange.userId !== userEmail) {
            throw new Error('You can only accept your own exchange requests');
        }
        if (exchange.status !== 'price_set') {
            throw new Error('Price must be set by shop owner first');
        }

        await ExchangeRequestModel.updateStatus(exchangeId, 'user_accepted');

        // Mark old toys as pending_exchange
        for (const oldToy of exchange.oldToys) {
            if (oldToy.status === 'approved') {
                await OldToyModel.updateStatus(oldToy.oldToyId, 'pending_exchange');
            }
        }

        // Send emails
        try {
            await EmailService.sendExchangeAcceptedNotification(userEmail, exchange.productId, exchange.finalPrice);
            await EmailService.sendExchangeAcceptedToShopOwner(exchange.shopOwnerEmail, exchange.productId, userEmail);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return await ExchangeRequestModel.findById(exchangeId);
    },

    userRejectExchange: async (exchangeId, userEmail) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }
        if (exchange.userId !== userEmail) {
            throw new Error('You can only reject your own exchange requests');
        }
        if (exchange.status !== 'price_set') {
            throw new Error('Can only reject after price is set');
        }

        await ExchangeRequestModel.updateStatus(exchangeId, 'user_rejected');

        // Send email
        try {
            await EmailService.sendExchangeRejectedNotification(exchange.shopOwnerEmail, exchange.productId, userEmail);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return await ExchangeRequestModel.findById(exchangeId);
    },

    confirmExchangePayment: async (exchangeId, paymentIntentId) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }
        if (exchange.status !== 'user_accepted') {
            throw new Error('Exchange must be accepted by user first');
        }

        // Verify payment (you can add PaymentService.confirmPayment here if needed)
        // For now, we'll trust that payment was successful if this is called

        // Update exchange status to payment_confirmed
        await ExchangeRequestModel.update(exchangeId, {
            status: 'payment_confirmed',
            paymentIntentId: paymentIntentId,
            paymentConfirmedAt: new Date()
        });

        return await ExchangeRequestModel.findById(exchangeId);
    },

    confirmExchange: async (exchangeId, shopOwnerEmail) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }
        if (exchange.shopOwnerEmail !== shopOwnerEmail) {
            throw new Error('You can only confirm your own shop exchanges');
        }
        // Allow confirmation if payment is confirmed OR user accepted (for backward compatibility)
        if (exchange.status !== 'payment_confirmed' && exchange.status !== 'user_accepted') {
            throw new Error('Payment must be confirmed before delivery can be arranged');
        }

        // Get product
        const product = await ToyModel.findById(exchange.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Check available quantity
        const currentQuantity = product.available_quantity || product.quantity || 0;
        if (currentQuantity <= 0) {
            throw new Error('Product is out of stock');
        }

        // Decrement product quantity
        await ToyModel.decrementQuantity(exchange.productId, 1);

        // Mark product as purchased
        await ToyModel.update(exchange.productId, {
            purchasedBy: exchange.userId,
            purchasedAt: new Date(),
            purchaseMethod: 'exchange',
            purchaseAmount: exchange.finalPrice
        });

        // Mark old toys as exchanged
        for (const oldToy of exchange.oldToys) {
            if (oldToy.status === 'approved') {
                await OldToyModel.updateStatus(oldToy.oldToyId, 'exchanged');
            }
        }

        // Create transaction record
        await TransactionModel.create({
            type: 'exchange',
            userId: exchange.userId,
            toyId: exchange.productId,
            amount: exchange.finalPrice,
            currency: 'money',
            status: 'completed',
            description: `Exchanged old toys for ${product.name} with ${exchange.totalDiscount} discount`,
            paymentDetails: {
                paymentIntentId: exchange.paymentIntentId,
                method: 'stripe',
                originalPrice: exchange.originalPrice,
                totalDiscount: exchange.totalDiscount,
                finalPrice: exchange.finalPrice
            }
        });

        // Update exchange status to confirmed (delivery arranged)
        await ExchangeRequestModel.update(exchangeId, {
            status: 'confirmed',
            deliveryStatus: 'pending',
            confirmedAt: new Date()
        });

        // Send delivery notification
        try {
            await EmailService.sendExchangeDeliveryNotification(exchange.userId, exchange.productId);
            await EmailService.sendExchangeDeliveryToShopOwner(exchange.shopOwnerEmail, exchange.productId, exchange.userId);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
        }

        return await ExchangeRequestModel.findById(exchangeId);
    }
};

module.exports = ExchangeService;

