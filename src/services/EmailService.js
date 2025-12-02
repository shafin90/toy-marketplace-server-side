const nodemailer = require('nodemailer');

// Configure email transporter
// For production, use environment variables for credentials
const createTransporter = () => {
    // Using Gmail as example - configure based on your email provider
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
};

const EmailService = {
    sendEmail: async (to, subject, html, text) => {
        try {
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: to,
                subject: subject,
                html: html,
                text: text || html.replace(/<[^>]*>/g, '')
            };

            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email');
        }
    },

    sendOldToyApproved: async (userEmail, toyName, coinsAwarded) => {
        const subject = '🎉 Your Old Toy Has Been Approved!';
        const html = `
            <h2>Congratulations!</h2>
            <p>Your old toy "<strong>${toyName}</strong>" has been approved by a shop owner.</p>
            <p>You have been awarded <strong>💎 ${coinsAwarded} coins</strong>!</p>
            <p>You can now use these coins to purchase toys from our shop.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendOldToyRejected: async (userEmail, toyName, rejectionReason) => {
        const subject = 'Old Toy Listing Rejected';
        const html = `
            <h2>Old Toy Listing Update</h2>
            <p>Unfortunately, your old toy "<strong>${toyName}</strong>" has been rejected.</p>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p>You can try listing another toy or contact support for more information.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendPurchaseConfirmation: async (buyerEmail, toyName, purchaseMethod, amount) => {
        const subject = 'Purchase Confirmation - CARZ Toy Marketplace';
        const html = `
            <h2>Purchase Successful! 🎉</h2>
            <p>Thank you for your purchase!</p>
            <p><strong>Toy:</strong> ${toyName}</p>
            <p><strong>Payment Method:</strong> ${purchaseMethod === 'coins' ? 'Coins' : 'Money'}</p>
            <p><strong>Amount:</strong> ${purchaseMethod === 'coins' ? `💎 ${amount}` : `৳ ${amount}`}</p>
            <p>Please contact the shop owner to arrange pickup.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(buyerEmail, subject, html);
    },

    sendNewPurchaseNotification: async (shopOwnerEmail, toyName, buyerEmail) => {
        const subject = 'New Purchase - CARZ Toy Marketplace';
        const html = `
            <h2>New Purchase Notification</h2>
            <p>Your toy "<strong>${toyName}</strong>" has been purchased!</p>
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            <p>Please contact the buyer to arrange pickup.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(shopOwnerEmail, subject, html);
    },

    // Exchange-related emails
    sendExchangeRequestNotification: async (userEmail, productName, oldToyCount) => {
        const subject = 'Exchange Request Submitted - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Request Submitted! ✅</h2>
            <p>Your exchange request for "<strong>${productName}</strong>" has been submitted successfully.</p>
            <p>You have selected <strong>${oldToyCount} old toy(s)</strong> for exchange.</p>
            <p>The shop owner will review your request and set discount prices for each old toy.</p>
            <p>You will receive an email once the prices are set.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendExchangeRequestToShopOwner: async (shopOwnerEmail, productName, userEmail, oldToyCount) => {
        const subject = 'New Exchange Request - CARZ Toy Marketplace';
        const html = `
            <h2>New Exchange Request 📦</h2>
            <p>You have received a new exchange request for your product "<strong>${productName}</strong>".</p>
            <p><strong>User:</strong> ${userEmail}</p>
            <p><strong>Old Toys Selected:</strong> ${oldToyCount}</p>
            <p>Please log in to your dashboard to review the request and set discount prices for each old toy.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(shopOwnerEmail, subject, html);
    },

    sendExchangePriceSetNotification: async (userEmail, productId, finalPrice, originalPrice, totalDiscount) => {
        const subject = 'Exchange Price Set - Review & Accept - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Price Set! 💰</h2>
            <p>The shop owner has set the discount prices for your old toys.</p>
            <p><strong>Original Price:</strong> ৳ ${originalPrice}</p>
            <p><strong>Total Discount:</strong> ৳ ${totalDiscount}</p>
            <p><strong>Final Price:</strong> ৳ ${finalPrice}</p>
            <p>Please log in to your account to accept or reject this exchange offer.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendExchangeAcceptedNotification: async (userEmail, productId, finalPrice) => {
        const subject = 'Exchange Accepted - Payment Required - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Accepted! ✅</h2>
            <p>You have accepted the exchange offer.</p>
            <p><strong>Final Price to Pay:</strong> ৳ ${finalPrice}</p>
            <p>Please complete the payment to confirm your exchange.</p>
            <p>After payment confirmation, delivery will be arranged.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendExchangeAcceptedToShopOwner: async (shopOwnerEmail, productId, userEmail) => {
        const subject = 'Exchange Accepted by User - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Accepted! 🎉</h2>
            <p>The user has accepted your exchange offer.</p>
            <p><strong>User:</strong> ${userEmail}</p>
            <p>Please prepare the product for delivery. The delivery person will collect the old toys when delivering the new product.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(shopOwnerEmail, subject, html);
    },

    sendExchangeRejectedNotification: async (shopOwnerEmail, productId, userEmail) => {
        const subject = 'Exchange Rejected by User - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Rejected</h2>
            <p>The user has rejected your exchange offer.</p>
            <p><strong>User:</strong> ${userEmail}</p>
            <p>The exchange request has been cancelled.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(shopOwnerEmail, subject, html);
    },

    sendExchangeDeliveryNotification: async (userEmail, productId) => {
        const subject = 'Exchange Confirmed - Delivery Arranged - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Confirmed! 🚚</h2>
            <p>Your exchange has been confirmed!</p>
            <p>A delivery person will arrive with your new product and collect your old toys.</p>
            <p>Please keep your old toys ready for pickup.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(userEmail, subject, html);
    },

    sendExchangeDeliveryToShopOwner: async (shopOwnerEmail, productId, userEmail) => {
        const subject = 'Exchange Delivery Confirmed - CARZ Toy Marketplace';
        const html = `
            <h2>Exchange Delivery Confirmed</h2>
            <p>Delivery has been arranged for the exchange.</p>
            <p><strong>User:</strong> ${userEmail}</p>
            <p>The delivery person will deliver the new product and collect the old toys.</p>
            <br>
            <p>Thank you for using CARZ Toy Marketplace!</p>
        `;
        return await EmailService.sendEmail(shopOwnerEmail, subject, html);
    }
};

module.exports = EmailService;

