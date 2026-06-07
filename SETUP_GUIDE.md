# 🚗 Parking Management System - Step-by-Step Setup Guide

This guide will walk you through setting up the entire project on your computer from scratch.

---

## **PART 1: Prerequisites Installation**

### **Step 1: Install Node.js and npm**

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version
   - It includes npm automatically

2. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers like `v18.x.x` and `8.x.x`

---

### **Step 2: Install MySQL**

#### **On Windows:**
1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Choose **MySQL Community Server**
3. Download the installer (`.msi` file)
4. Run the installer and follow setup wizard
5. During installation:
   - Choose **Setup Type:** Development Default
   - Accept default configuration
   - **Important:** Set a password for root user (remember this!)
6. MySQL will run as a service

#### **On Mac:**
```bash
# Using Homebrew (install Homebrew first from https://brew.sh/)
brew install mysql

# Start MySQL
brew services start mysql

# Set password for root user
mysql -u root
```

#### **On Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server

# Start MySQL
sudo service mysql start

# Secure installation
sudo mysql_secure_installation
```

3. **Verify MySQL Installation:**
   ```bash
   mysql --version
   ```

---

### **Step 3: Install Elasticsearch (Optional but Recommended)**

#### **On Windows:**
1. Download from: https://www.elastic.co/downloads/elasticsearch
2. Extract the `.zip` file to a folder (e.g., `C:\elasticsearch`)
3. Open Command Prompt and navigate to the folder:
   ```bash
   cd C:\elasticsearch
   bin\elasticsearch.bat
   ```

#### **On Mac:**
```bash
brew install elasticsearch

# Start Elasticsearch
brew services start elasticsearch
```

#### **On Linux:**
```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.0.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-8.0.0-linux-x86_64.tar.gz
cd elasticsearch-8.0.0
./bin/elasticsearch
```

3. **Verify (in new terminal/command prompt):**
   ```bash
   curl http://localhost:9200
   ```
   You should see JSON response with version info.

---

## **PART 2: Project Setup**

### **Step 4: Clone/Download the Repository**

1. **Open Command Prompt/Terminal**

2. **Navigate to where you want to store the project:**
   ```bash
   cd Desktop
   # or
   cd Documents
   # or any folder you prefer
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/devanshmalik01/parking-management-system.git
   cd parking-management-system
   ```

---

### **Step 5: Install Node.js Dependencies**

1. **In the project folder, run:**
   ```bash
   npm install
   ```

2. **Wait for it to complete** (may take 2-3 minutes)

3. **Verify installation:**
   ```bash
   npm list
   ```
   You should see the list of installed packages.

---

### **Step 6: Create MySQL Database and Tables**

#### **Method 1: Using MySQL Command Line**

1. **Open MySQL Command Prompt/Terminal:**
   ```bash
   mysql -u root -p
   ```
   Enter your root password when prompted

2. **Copy-paste the entire schema from `database/schema.sql`:**

   ```sql
   -- Create database
   CREATE DATABASE IF NOT EXISTS parking_management;
   USE parking_management;

   -- Users table
   CREATE TABLE IF NOT EXISTS users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     role ENUM('assistant', 'admin') NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   -- Vehicles table
   CREATE TABLE IF NOT EXISTS vehicles (
     id INT PRIMARY KEY AUTO_INCREMENT,
     vehicle_no VARCHAR(50) UNIQUE NOT NULL,
     vehicle_type VARCHAR(50) NOT NULL,
     entry_time TIMESTAMP NOT NULL,
     exit_time TIMESTAMP NULL,
     status ENUM('parked', 'left') DEFAULT 'parked',
     allowed_by INT NOT NULL,
     bill_amount DECIMAL(10, 2) NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (allowed_by) REFERENCES users(id),
     INDEX idx_status (status),
     INDEX idx_vehicle_no (vehicle_no),
     INDEX idx_entry_time (entry_time)
   );

   -- Create index for billing calculations
   CREATE INDEX idx_vehicles_billing ON vehicles(status, exit_time);
   ```

3. **Press Enter to execute each section**

4. **Exit MySQL:**
   ```bash
   EXIT;
   ```

#### **Method 2: Using MySQL Workbench (GUI)**

1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Open MySQL Workbench
3. Create new connection to localhost
4. Open a new SQL script
5. Paste the schema from `database/schema.sql`
6. Execute (Ctrl+Shift+Enter or click Execute)

---

### **Step 7: Configure Environment Variables**

1. **In the project folder, create a file named `.env`**
   - On Windows: Right-click → New → Text Document → Rename to `.env`
   - On Mac/Linux: In terminal: `touch .env`

2. **Open `.env` file and add:**
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MySQL Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=parking_management
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_secret_key_12345
   JWT_EXPIRE=7d

   # Elasticsearch Configuration
   ELASTIC_HOST=localhost
   ELASTIC_PORT=9200
   ```

3. **Replace `your_password_here` with your MySQL root password**

4. **Save the file**

---

## **PART 3: Running the Application**

### **Step 8: Start the Server**

1. **In the project folder (parking-management-system), open Command Prompt/Terminal**

2. **Run the server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   Server running on port 3000
   ```

4. **Server is now running at:** `http://localhost:3000`

---

### **Step 9: Verify Everything Works**

1. **Open a new Command Prompt/Terminal window** (keep the server running in the first one)

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   
   Or visit in browser: `http://localhost:3000/health`

3. **You should see:**
   ```json
   {"message":"Server is running"}
   ```

---

## **PART 4: Using the API**

### **Step 10: Test API Endpoints**

You can use **Postman** to test the API:

1. **Download Postman:** https://www.postman.com/downloads/

2. **Or use Command Line (easier):**

#### **Create Admin User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@parking.com",
    "password": "admin123",
    "role": "admin"
  }'
```

#### **Create Assistant User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Assistant User",
    "email": "assistant@parking.com",
    "password": "assistant123",
    "role": "assistant"
  }'
```

#### **Login User:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "assistant@parking.com",
    "password": "assistant123"
  }'
```

You'll get a token - **save this token**, you need it for other requests!

#### **Vehicle Entry (Replace TOKEN with your token):**
```bash
curl -X POST http://localhost:3000/api/assistant/vehicle/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "vehicleNo": "MH01AB1234",
    "vehicleType": "car"
  }'
```

#### **Vehicle Exit:**
```bash
curl -X POST http://localhost:3000/api/assistant/vehicle/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "vehicleNo": "MH01AB1234"
  }'
```

#### **Get All Parked Vehicles (Admin only):**
```bash
curl -X GET http://localhost:3000/api/admin/vehicles \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## **PART 5: Sync Data to Elasticsearch (Optional)**

1. **Make sure Elasticsearch is running** (see Step 3)

2. **In a new Command Prompt/Terminal, run:**
   ```bash
   node scripts/syncToElastic.js
   ```

3. **You should see:**
   ```
   Starting sync to Elasticsearch...
   Deleted existing index
   Created new index
   Synced X vehicles to Elasticsearch
   Sync completed successfully!
   ```

---

## **PART 6: Using Postman (Recommended for Easy Testing)**

### **Install and Setup Postman:**

1. **Download:** https://www.postman.com/downloads/

2. **Create a new Collection** (File → New Collection)

3. **Add requests for each endpoint:**

   - **Method:** POST
   - **URL:** http://localhost:3000/api/auth/register
   - **Headers:** Content-Type: application/json
   - **Body (raw):**
     ```json
     {
       "name": "Test User",
       "email": "test@parking.com",
       "password": "test123",
       "role": "assistant"
     }
     ```

4. **Use the same pattern for other endpoints**

---

## **Troubleshooting**

### **"Cannot find module" Error**
- Solution: Run `npm install` again

### **"Connection refused" to MySQL**
- Make sure MySQL is running
- Check if password in `.env` is correct
- Try: `mysql -u root -p` to verify MySQL works

### **Port 3000 already in use**
- Solution 1: Kill the process using port 3000
- Solution 2: Change PORT in `.env` to something else (e.g., 3001)

### **Elasticsearch not connecting**
- Make sure Elasticsearch is running
- Check if it's on port 9200
- Test: `curl http://localhost:9200`

### **JWT Token Errors**
- Make sure you're including the token in Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`
- Token might be expired after 7 days

---

## **Project Structure Explanation**

```
parking-management-system/
├── server.js              # Main server file
├── package.json          # Dependencies
├── .env                  # Environment variables (create this)
├── config/
│   ├── database.js      # MySQL connection
│   └── elasticsearch.js # Elasticsearch client
├── database/
│   └── schema.sql       # Database structure
├── routes/
│   ├── auth.js          # Login/Register
│   ├── admin.js         # Admin endpoints
│   ├── assistant.js     # Assistant endpoints
│   └── search.js        # Search functionality
├── middleware/
│   └── auth.js          # JWT verification
└── scripts/
    └── syncToElastic.js # DB to Elasticsearch sync
```

---

## **Common API Responses**

### **Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### **Error Response:**
```json
{
  "error": "Error message here"
}
```

### **Status Codes:**
- **200**: Success
- **201**: Created
- **400**: Bad Request (missing fields)
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Server Error

---

## **Next Steps After Setup**

1. ✅ Test all API endpoints
2. ✅ Create sample users (admin + assistant)
3. ✅ Test vehicle entry/exit flow
4. ✅ Generate bills and verify calculations
5. ✅ Test admin dashboard
6. ✅ Sync data to Elasticsearch
7. ✅ Test search functionality

---

## **Need Help?**

- Check the main **README.md** for project overview
- Review **routes/** folder for API documentation
- Check database **schema.sql** for data structure

Happy coding! 🎉
