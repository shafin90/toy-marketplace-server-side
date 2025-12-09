/**
 * Script to create an admin user
 * Run with: node scripts/createAdmin.js
 */

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = `mongodb+srv://chakri:chakri@cluster0.yhuz2xd.mongodb.net/toys?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function createAdmin() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('Carz');
        const usersCollection = db.collection('users');

        // Admin credentials
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@carz.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log(`Email: ${adminEmail}`);
            console.log('To reset password, delete the user from database first.');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const adminUser = {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: 'admin',
            coins: 1000,
            credits: 1000,
            totalEarned: 0,
            totalSpent: 0,
            rating: 0,
            totalRatings: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await usersCollection.insertOne(adminUser);
        console.log('✅ Admin user created successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role:     admin`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await client.close();
        console.log('\nDatabase connection closed.');
    }
}

createAdmin();

