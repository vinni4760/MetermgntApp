require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Vendor.deleteMany({});
        console.log('✅ Data cleared\n');

        // Create Vendors first
        console.log('Creating vendors...');
        const vendors = await Vendor.create([
            {
                name: 'PowerGrid Corp',
                contactNumber: '9876543210',
                email: 'contact@powergrid.com'
            },
            {
                name: 'EnergyPlus Ltd',
                contactNumber: '9876543211',
                email: 'info@energyplus.com'
            },
            {
                name: 'MetroSupply Inc',
                contactNumber: '9876543212',
                email: 'sales@metrosupply.com'
            }
        ]);
        console.log(`✅ Created ${vendors.length} vendors\n`);

        // Create Users
        console.log('Creating users...');
        const users = await User.create([
            // Admin
            {
                username: 'admin',
                password: 'admin123',
                name: 'Admin User',
                role: 'ADMIN'
            },
            // Installers
            {
                username: 'rajesh',
                password: 'password',
                name: 'Rajesh Kumar',
                role: 'INSTALLER'
            },
            {
                username: 'amit',
                password: 'password',
                name: 'Amit Patel',
                role: 'INSTALLER'
            },
            {
                username: 'vijay',
                password: 'password',
                name: 'Vijay Sharma',
                role: 'INSTALLER'
            },
            // Vendors
            {
                username: 'vendor1',
                password: 'password',
                name: 'PowerGrid Corp User',
                role: 'VENDOR',
                vendorId: vendors[0]._id
            },
            {
                username: 'vendor2',
                password: 'password',
                name: 'EnergyPlus User',
                role: 'VENDOR',
                vendorId: vendors[1]._id
            },
            {
                username: 'vendor3',
                password: 'password',
                name: 'MetroSupply User',
                role: 'VENDOR',
                vendorId: vendors[2]._id
            }
        ]);
        console.log(`✅ Created ${users.length} users\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 Login Credentials:\n');
        console.log('ADMIN:');
        console.log('  Username: admin');
        console.log('  Password: admin123\n');
        console.log('INSTALLERS:');
        console.log('  Username: rajesh  | Password: password');
        console.log('  Username: amit    | Password: password');
        console.log('  Username: vijay   | Password: password\n');
        console.log('VENDORS:');
        console.log('  Username: vendor1 | Password: password');
        console.log('  Username: vendor2 | Password: password');
        console.log('  Username: vendor3 | Password: password\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
