const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const { generateToken } = require('../utils/jwt');

const AuthService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} User object with token
     */
    register: async (userData) => {
        const { email, password, name, role, shopName, shopAddress, phone, photoURL } = userData;

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name,
            role: role || 'user',
            photoURL: photoURL || '',
            shopName: role === 'shop_owner' ? shopName : undefined,
            shopAddress: role === 'shop_owner' ? shopAddress : undefined,
            phone: role === 'shop_owner' ? phone : undefined,
            coins: role === 'shop_owner' ? 100 : 50
        });

        // Generate token
        const token = generateToken({
            email: user.email,
            name: user.name,
            role: user.role,
            _id: user._id.toString()
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} User object with token
     */
    login: async (email, password) => {
        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate token
        const token = generateToken({
            email: user.email,
            name: user.name,
            role: user.role,
            _id: user._id.toString()
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }
};

module.exports = AuthService;

