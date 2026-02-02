# MongoDB Atlas Connection Setup

## Current Status
❌ Connection failing: `cluster0.abcd1.mongodb.net` is invalid (placeholder, not real cluster ID)

## How to Get Your Real Connection String

### Step 1: Go to MongoDB Atlas
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your project and cluster `Cluster0`

### Step 2: Click "Connect"
1. Click the green **"Connect"** button
2. Select **"Drivers"** (not Shell)
3. Choose **"Node.js"** as the driver

### Step 3: Copy the Connection String
You'll see a connection string like:
```
mongodb+srv://amitxrajwar_db_user:iGiYidmzjhTQgkho@cluster0.XXXXX.mongodb.net/jagoindia?retryWrites=true&w=majority
```

**The `XXXXX` is your actual cluster ID** (e.g., `ab12cd`, `xyz789`, etc.)

### Step 4: Update .env File
Replace the placeholder in `.env`:

**WRONG (current):**
```
MONGO_URI=mongodb+srv://amitxrajwar_db_user:iGiYidmzjhTQgkho@cluster0.abcd1.mongodb.net/jagoindia
```

**CORRECT (replace abcd1 with your actual cluster ID):**
```
MONGO_URI=mongodb+srv://amitxrajwar_db_user:iGiYidmzjhTQgkho@cluster0.XXXXX.mongodb.net/jagoindia
```

### Example
If MongoDB Atlas shows: `cluster0.a1b2c3d4.mongodb.net`

Then use:
```
MONGO_URI=mongodb+srv://amitxrajwar_db_user:iGiYidmzjhTQgkho@cluster0.a1b2c3d4.mongodb.net/jagoindia
```

---

## Verify Credentials
✅ Username: `amitxrajwar_db_user`
✅ Password: `iGiYidmzjhTQgkho`
✅ Cluster: `Cluster0`
⚠️ Cluster ID: **REPLACE `abcd1` with actual ID from MongoDB Atlas**
✅ Database: `jagoindia`

---

## After Updating .env
1. Save the `.env` file
2. The server will auto-restart (nodemon watches for changes)
3. You should see: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`

---

## If Still Having Issues
1. Verify IP address is whitelisted in MongoDB Atlas Network Access
2. Check username and password are exactly correct
3. Ensure cluster is not paused
4. Make sure you're using the correct cluster name from the connection string
