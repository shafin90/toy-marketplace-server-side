const ShopModel = require('../models/ShopModel');
const UserModel = require('../models/UserModel');
const ToyModel = require('../models/ToyModel');

const ShopService = {
    createOrUpdateShop: async (shopOwnerEmail, shopData) => {
        const existingShop = await ShopModel.findByOwnerEmail(shopOwnerEmail);
        
        if (existingShop) {
            return await ShopModel.update(shopOwnerEmail, shopData);
        } else {
            return await ShopModel.create({
                shopOwnerEmail: shopOwnerEmail,
                ...shopData
            });
        }
    },

    getShopByOwner: async (shopOwnerEmail) => {
        let shop = await ShopModel.findByOwnerEmail(shopOwnerEmail);
        
        // If shop doesn't exist, create from user data
        if (!shop) {
            const user = await UserModel.findByEmail(shopOwnerEmail);
            if (user && user.role === 'shop_owner') {
                shop = await ShopModel.create({
                    shopOwnerEmail: shopOwnerEmail,
                    shopName: user.shopName || 'My Shop',
                    shopAddress: user.shopAddress || '',
                    shopLocation: user.shopAddress || '',
                    shopImage: user.photoURL || '',
                    shopDetails: '',
                    shopDescription: '',
                    members: []
                });
            }
        }

        if (shop) {
            // Get shop owner details
            const owner = await UserModel.findByEmail(shopOwnerEmail);
            shop.owner = owner;

            // Get all toys from this shop and group by category
            const allToys = await ToyModel.findBySeller(shopOwnerEmail);
            shop.toys = allToys;
            
            // Group toys by category
            const toysByCategory = {};
            allToys.forEach(toy => {
                const category = toy.subcategory || toy.sub_category || 'Uncategorized';
                if (!toysByCategory[category]) {
                    toysByCategory[category] = [];
                }
                toysByCategory[category].push(toy);
            });
            shop.toysByCategory = toysByCategory;
        }

        return shop;
    },

    getAllShops: async () => {
        const shops = await ShopModel.findAll();
        
        // Populate owner details and toy count
        for (const shop of shops) {
            const owner = await UserModel.findByEmail(shop.shopOwnerEmail);
            shop.owner = owner;
            
            const toys = await ToyModel.findBySeller(shop.shopOwnerEmail);
            shop.toyCount = toys.length;
        }

        return shops;
    },

    addShopMember: async (shopOwnerEmail, memberData) => {
        const shop = await ShopModel.findByOwnerEmail(shopOwnerEmail);
        if (!shop) {
            throw new Error('Shop not found');
        }

        // Check if member already exists
        const existingMember = shop.members?.find(m => m.email === memberData.email);
        if (existingMember) {
            throw new Error('Member already exists');
        }

        return await ShopModel.addMember(shopOwnerEmail, memberData);
    },

    removeShopMember: async (shopOwnerEmail, memberEmail) => {
        return await ShopModel.removeMember(shopOwnerEmail, memberEmail);
    },

    updateShop: async (shopOwnerEmail, updateData) => {
        return await ShopModel.update(shopOwnerEmail, updateData);
    }
};

module.exports = ShopService;

