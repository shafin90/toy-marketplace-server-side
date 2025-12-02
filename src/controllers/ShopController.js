const ShopService = require('../services/ShopService');

const ShopController = {
    getAllShops: async (req, res) => {
        try {
            const shops = await ShopService.getAllShops();
            res.send(shops);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    getShopByOwner: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.params;
            const shop = await ShopService.getShopByOwner(shopOwnerEmail);
            if (!shop) {
                return res.status(404).send({ message: 'Shop not found' });
            }
            res.send(shop);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    createOrUpdateShop: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.params;
            
            const shopData = {
                shopName: req.body.shopName,
                shopDetails: req.body.shopDetails,
                shopLocation: req.body.shopLocation,
                shopAddress: req.body.shopLocation || req.body.shopAddress,
                shopImage: req.file ? `/uploads/${req.file.filename}` : (req.body.shopImage || req.body.existingImage),
                shopDescription: req.body.shopDescription || req.body.shopDetails
            };

            const result = await ShopService.createOrUpdateShop(shopOwnerEmail, shopData);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    addShopMember: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.params;
            const result = await ShopService.addShopMember(shopOwnerEmail, req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    removeShopMember: async (req, res) => {
        try {
            const { shopOwnerEmail, memberEmail } = req.params;
            const result = await ShopService.removeShopMember(shopOwnerEmail, memberEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = ShopController;

