# MongoDB Atlas Setup Guide

## Step 1: Create Free Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Choose **FREE tier** (M0 Sandbox - 512 MB storage)

## Step 2: Create Cluster

1. After login, click **"Build a Database"**
2. Choose **FREE** tier (Shared cluster)
3. Cloud Provider: **AWS** (recommended)
4. Region: Choose closest to India (e.g., **Mumbai ap-south-1**)
5. Cluster Name: `MeterManagement`
6. Click **Create Cluster** (takes 3-5 minutes)

## Step 3: Setup Database Access

1. Click **Database Access** in left sidebar
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `meterAdmin`
5. Password: Click **Autogenerate Secure Password** (save this!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

## Step 4: Setup Network Access

1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
4. Click **Confirm**

> **Note:** For production, restrict to specific IPs!

## Step 5: Get Connection String

1. Go back to **Database** (Clusters)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string:
   ```
   mongodb+srv://meterAdmin:<password>@metermanagement.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password

## Step 6: Save Connection String

You'll use this in backend `.env` file:
```env
MONGODB_URI=mongodb+srv://meterAdmin:YOUR_PASSWORD@metermanagement.xxxxx.mongodb.net/meter-management?retryWrites=true&w=majority
```

## ✅ Atlas Setup Complete!

Your MongoDB database is ready. Proceed to backend implementation.

---

## Troubleshooting

**Can't connect?**
- Check password is correct (no special characters causing issues)
- Verify IP whitelist includes your current IP
- Make sure cluster is fully deployed (green status)

**Connection string format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME
```
