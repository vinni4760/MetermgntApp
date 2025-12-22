require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple connection test
async function testConnection() {
    try {
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
        console.log('\nAttempting to connect to MongoDB...\n');

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Successfully connected to MongoDB!');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}\n`);

        // Now manually insert a user
        const User = mongoose.connection.collection('users');

        // Clear existing
        await User.deleteMany({});
        console.log('✅ Cleared existing users\n');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Insert admin
        const result = await User.insertOne({
            username: 'admin',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Created admin user:', result.insertedId);
        console.log('\nLogin credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testConnection();
