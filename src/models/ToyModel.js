const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'toys';

const ToyModel = {
    findAllAvailable: async () => {
        const query = { 
            status: 'available',
            type: 'shop_toy' // Only show shop toys in marketplace
        };
        return await getCollection(collectionName).find(query).toArray();
    },

    findById: async (id) => {
        const query = { _id: new ObjectId(id) };
        return await getCollection(collectionName).findOne(query);
    },

    create: async (toy) => {
        const newToy = {
            ...toy,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await getCollection(collectionName).insertOne(newToy);
    },

    update: async (id, updatedData) => {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { 
            $set: { 
                ...updatedData, 
                updatedAt: new Date() 
            } 
        };
        return await getCollection(collectionName).updateOne(filter, updateDoc);
    },

    delete: async (id) => {
        const query = { _id: new ObjectId(id) };
        return await getCollection(collectionName).deleteOne(query);
    },

    findBySeller: async (email) => {
        const query = { listedBy: email };
        return await getCollection(collectionName).find(query).toArray();
    },

    findByType: async (type) => {
        const query = { type: type };
        return await getCollection(collectionName).find(query).toArray();
    },

    findPendingOldToys: async () => {
        const query = { 
            type: 'old_toy',
            status: 'pending' 
        };
        return await getCollection(collectionName).find(query).toArray();
    },

    findPendingByShopOwner: async (shopOwnerEmail) => {
        const query = { 
            type: 'old_toy',
            status: 'pending',
            shopOwnerEmail: shopOwnerEmail 
        };
        return await getCollection(collectionName).find(query).toArray();
    },

    approveOldToy: async (id, shopOwnerEmail, coinsAwarded) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'approved',
                    approvedBy: shopOwnerEmail,
                    approvedAt: new Date(),
                    coinsAwarded: coinsAwarded
                } 
            }
        );
    },

    rejectOldToy: async (id, shopOwnerEmail, rejectionReason) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'rejected',
                    rejectedBy: shopOwnerEmail,
                    rejectedAt: new Date(),
                    rejectionReason: rejectionReason
                } 
            }
        );
    },

    markAsSold: async (id, buyerEmail, purchaseMethod, purchaseAmount, newQuantity = null) => {
        const updateData = {
            purchasedBy: buyerEmail,
            purchasedAt: new Date(),
            purchaseMethod: purchaseMethod,
            purchaseAmount: purchaseAmount,
            updatedAt: new Date()
        };

        // If newQuantity is provided, update quantity
        if (newQuantity !== null) {
            updateData.available_quantity = newQuantity;
            updateData.quantity = newQuantity;
            
            // If quantity reaches 0, mark as sold, otherwise keep available
            if (newQuantity <= 0) {
                updateData.status = 'sold';
            } else {
                updateData.status = 'available';
            }
        } else {
            // If no quantity provided, mark as sold (legacy behavior)
            updateData.status = 'sold';
        }

        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
    },

    decrementQuantity: async (id, amount = 1) => {
        // First check current quantity
        const toy = await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
        if (!toy) {
            throw new Error('Toy not found');
        }

        const currentQuantity = toy.available_quantity || toy.quantity || 0;
        if (currentQuantity < amount) {
            throw new Error('Insufficient quantity available');
        }

        // Atomically decrement quantity
        const result = await getCollection(collectionName).findOneAndUpdate(
            { 
                _id: new ObjectId(id),
                $or: [
                    { available_quantity: { $gte: amount } },
                    { quantity: { $gte: amount } }
                ]
            },
            { 
                $inc: { 
                    available_quantity: -amount,
                    quantity: -amount
                },
                $set: {
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result || !result.value) {
            throw new Error('Failed to update quantity - may be out of stock');
        }

        // If quantity reaches 0 or below, update status to sold
        const newQuantity = result.value.available_quantity || result.value.quantity || 0;
        if (newQuantity <= 0) {
            await getCollection(collectionName).updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'sold' } }
            );
        }

        return result;
    },

    markAsSwapped: async (id, newOwnerEmail) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: 'swapped', newOwner: newOwnerEmail } }
        );
    }
};

module.exports = ToyModel;
