require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully!');

        // Test creating a vendor
        const vendor = await Vendor.create({
            name: 'Test Vendor',
            contactNumber: '1234567890',
            email: 'test@example.com'
        });
        console.log('✅ Vendor created:', vendor.name);

        // Test creating a user
        const user = await User.create({
            username: 'testuser',
            password: 'password123',
            name: 'Test User',
            role: 'ADMIN'
        });
        console.log('✅ User created:', user.username);

        // Clean up
        await Vendor.deleteMany({});
        await User.deleteMany({});
        console.log('✅ Test data cleaned up');

        console.log('\n✅ Connection test passed! Ready to seed database.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testConnection();
