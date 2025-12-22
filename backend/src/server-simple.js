require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock users database (in-memory for now)
const users = [
    // Admin
    { id: '1', username: 'admin', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
    // Installers
    { id: '2', username: 'rajesh', password: 'password', name: 'Rajesh Kumar', role: 'INSTALLER' },
    { id: '3', username: 'amit', password: 'password', name: 'Amit Patel', role: 'INSTALLER' },
    { id: '4', username: 'vijay', password: 'password', name: 'Vijay Sharma', role: 'INSTALLER' },
    // Vendors
    { id: '5', username: 'vendor1', password: 'password', name: 'PowerGrid Corp User', role: 'VENDOR', vendorId: 'v1' },
    { id: '6', username: 'vendor2', password: 'password', name: 'Energy Plus User', role: 'VENDOR', vendorId: 'v2' },
    { id: '7', username: 'vendor3', password: 'password', name: 'Metro Supply User', role: 'VENDOR', vendorId: 'v3' },
];

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running!' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            token: `fake-jwt-token-${user.id}`,
            user: userWithoutPassword
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// Get current user (requires token)
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from fake token
    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('fake-jwt-token-', '');

    const user = users.find(u => u.id === userId);

    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Login Credentials:\n');
    console.log('ADMIN:');
    console.log('  Username: admin   | Password: admin123\n');
    console.log('INSTALLERS:');
    console.log('  Username: rajesh  | Password: password');
    console.log('  Username: amit    | Password: password');
    console.log('  Username: vijay   | Password: password\n');
    console.log('VENDORS:');
    console.log('  Username: vendor1 | Password: password');
    console.log('  Username: vendor2 | Password: password');
    console.log('  Username: vendor3 | Password: password\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
