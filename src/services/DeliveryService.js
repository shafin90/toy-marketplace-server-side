const DeliveryModel = require('../models/DeliveryModel');
const ExchangeRequestModel = require('../models/ExchangeRequestModel');
const NotificationService = require('./NotificationService');

const DeliveryService = {
    createDelivery: async (exchangeId, deliveryData) => {
        const exchange = await ExchangeRequestModel.findById(exchangeId);
        if (!exchange) {
            throw new Error('Exchange request not found');
        }

        const delivery = await DeliveryModel.create({
            exchangeId,
            userEmail: exchange.userId,
            shopOwnerEmail: exchange.shopOwnerEmail,
            deliveryAddress: deliveryData.deliveryAddress,
            phone: deliveryData.phone,
            estimatedDeliveryDate: deliveryData.estimatedDeliveryDate
        });

        // Notify user
        await NotificationService.createNotification({
            userEmail: exchange.userId,
            type: 'delivery_created',
            title: 'Delivery Scheduled',
            message: 'Your order delivery has been scheduled',
            deliveryId: delivery._id.toString()
        });

        return delivery;
    },

    assignDeliveryMan: async (deliveryId, deliveryManEmail) => {
        const delivery = await DeliveryModel.assignDeliveryMan(deliveryId, deliveryManEmail);

        // Notify user
        await NotificationService.createNotification({
            userEmail: delivery.userEmail,
            type: 'delivery_assigned',
            title: 'Delivery Assigned',
            message: 'A delivery person has been assigned to your order',
            deliveryId: deliveryId
        });

        return delivery;
    },

    updateStatus: async (deliveryId, status, updateData = {}) => {
        const delivery = await DeliveryModel.updateStatus(deliveryId, status, updateData);

        // Notify user of status change
        await NotificationService.createNotification({
            userEmail: delivery.userEmail,
            type: 'delivery_update',
            title: 'Delivery Status Updated',
            message: `Your delivery status: ${status}`,
            deliveryId: deliveryId
        });

        return delivery;
    },

    updateTracking: async (deliveryId, trackingData) => {
        return await DeliveryModel.updateTracking(deliveryId, trackingData);
    },

    getDeliveryByExchange: async (exchangeId) => {
        return await DeliveryModel.findByExchange(exchangeId);
    },

    getUserDeliveries: async (userEmail) => {
        return await DeliveryModel.findByUser(userEmail);
    },

    getDeliveryManDeliveries: async (deliveryManEmail) => {
        return await DeliveryModel.findByDeliveryMan(deliveryManEmail);
    }
};

module.exports = DeliveryService;

