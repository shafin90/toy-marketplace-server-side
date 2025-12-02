const AuthService = require('../services/AuthService');

const AuthController = {
    register: async (req, res) => {
        try {
            const result = await AuthService.register(req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).send({ message: 'Email and password are required' });
            }
            const result = await AuthService.login(email, password);
            res.send(result);
        } catch (error) {
            res.status(401).send({ message: error.message });
        }
    }
};

module.exports = AuthController;

