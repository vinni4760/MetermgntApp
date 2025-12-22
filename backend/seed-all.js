require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAllUsers() {
    try {
        console.log('\nConnecting to MongoDB...\n');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.connection.collection('users');
        const Vendor = mongoose.connection.collection('vendors');

        // Clear existing
        await User.deleteMany({});
        await Vendor.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Create vendors first
        const vendors = await Vendor.insertMany([
            { name: 'PowerGrid Corp', contactNumber: '9876543210', email: 'contact@powergrid.com', assignedMetersCount: 0, createdAt: new Date() },
            { name: 'EnergyPlus Ltd', contactNumber: '9876543211', email: 'info@energyplus.com', assignedMetersCount: 0, createdAt: new Date() },
            { name: 'MetroSupply Inc', contactNumber: '9876543212', email: 'sales@metrosupply.com', assignedMetersCount: 0, createdAt: new Date() }
        ]);
        console.log(`✅ Created ${vendors.insertedCount} vendors\n`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const userPass = await bcrypt.hash('password', salt);

        // Insert users
        const users = await User.insertMany([
            // Admin
            { username: 'admin', password: adminPass, name: 'Admin User', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
            // Installers
            { username: 'rajesh', password: userPass, name: 'Rajesh Kumar', role: 'INSTALLER', createdAt: new Date(), updatedAt: new Date() },
            { username: 'amit', password: userPass, name: 'Amit Patel', role: 'INSTALLER', createdAt: new Date(), updatedAt: new Date() },
            { username: 'vijay', password: userPass, name: 'Vijay Sharma', role: 'INSTALLER', createdAt: new Date(), updatedAt: new Date() },
            // Vendors
            { username: 'vendor1', password: userPass, name: 'PowerGrid Corp User', role: 'VENDOR', vendorId: vendors.insertedIds[0], createdAt: new Date(), updatedAt: new Date() },
            { username: 'vendor2', password: userPass, name: 'EnergyPlus User', role: 'VENDOR', vendorId: vendors.insertedIds[1], createdAt: new Date(), updatedAt: new Date() },
            { username: 'vendor3', password: userPass, name: 'MetroSupply User', role: 'VENDOR', vendorId: vendors.insertedIds[2], createdAt: new Date(), updatedAt: new Date() }
        ]);

        console.log(`✅ Created ${users.insertedCount} users\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 Login Credentials:\n');
        console.log('ADMIN:');
        console.log('  admin / admin123\n');
        console.log('INSTALLERS:');
        console.log('  rajesh / password');
        console.log('  amit / password');
        console.log('  vijay / password\n');
        console.log('VENDORS:');
        console.log('  vendor1 / password');
        console.log('  vendor2 / password');
        console.log('  vendor3 / password\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedAllUsers();
