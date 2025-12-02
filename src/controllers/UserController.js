const UserService = require('../services/UserService');

const UserController = {
    registerUser: async (req, res) => {
        try {
            const result = await UserService.registerUser(req.body);
            res.send(result);
        } catch (error) {
            if (error.message === 'User already exists') {
                return res.send({ message: 'User already exists' }); // Maintain original behavior
            }
            res.status(500).send({ message: error.message });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await UserService.getUserByEmail(req.params.email);
            res.send(user);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const result = await UserService.updateProfile(req.params.email, req.body);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    upgradeToShopOwner: async (req, res) => {
        try {
            const result = await UserService.upgradeToShopOwner(req.params.email, req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = UserController;
