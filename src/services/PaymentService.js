const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PaymentService = {
    /**
     * Create Stripe payment intent
     * @param {number} amount - Amount in smallest currency unit (e.g., cents for USD, poisha for BDT)
     * @param {string} currency - Currency code (e.g., 'usd', 'bdt')
     * @param {Object} metadata - Additional metadata
     * @returns {Promise} Payment intent
     */
    createPaymentIntent: async (amount, currency = 'bdt', metadata = {}) => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to smallest unit (poisha for BDT)
                currency: currency,
                metadata: metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('Stripe error:', error);
            throw new Error(`Payment processing error: ${error.message}`);
        }
    },

    /**
     * Confirm payment intent
     * @param {string} paymentIntentId - Payment intent ID
     * @returns {Promise} Payment confirmation
     */
    confirmPayment: async (paymentIntentId) => {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            if (paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    paymentIntent: paymentIntent
                };
            }

            return {
                success: false,
                status: paymentIntent.status,
                message: 'Payment not completed'
            };
        } catch (error) {
            console.error('Payment confirmation error:', error);
            throw new Error(`Payment confirmation error: ${error.message}`);
        }
    },

    /**
     * Create bKash payment (mock - integrate with actual bKash API)
     * @param {number} amount - Amount
     * @param {string} phone - Phone number
     * @returns {Promise} Payment details
     */
    createBkashPayment: async (amount, phone) => {
        // TODO: Integrate with actual bKash API
        // This is a placeholder for bKash integration
        return {
            success: true,
            paymentId: `bkash_${Date.now()}`,
            amount: amount,
            phone: phone,
            message: 'bKash payment initiated. Please complete payment on your phone.'
        };
    }
};

module.exports = PaymentService;

