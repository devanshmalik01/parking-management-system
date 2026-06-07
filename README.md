# Parking Management System

A comprehensive parking management system with role-based authentication, vehicle tracking, and billing capabilities.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Search**: Elasticsearch
- **Authentication**: JWT

## Features

### 1. Authentication & Roles
- Login/Signup with two roles: Parking Assistant and Parking Admin
- JWT-based authentication
- Secure password hashing with bcryptjs

### 2. Admin Dashboard
- View all current (parked) vehicles with parking duration
- View list of exited (left) vehicles with completed details
- Real-time vehicle status monitoring

### 3. Assistant Operations
- **Entry**: Register new vehicles with vehicle number and type
- **Exit**: Mark vehicles as exited with automatic time recording
- **Billing**: Generate bills at exit at ₹10 per minute

### 4. Data Sync & Search
- Sync vehicle records from DB to Elasticsearch
- Advanced search by vehicle number, type, or assistant
- Re-runnable sync script without duplication

### 5. Records Storage
- Store all vehicle records in Elasticsearch index
- Efficient searching and filtering

## Database Schema

### Users Collection
- `_id`: User ID
- `name`: User name
- `email`: User email
- `role`: assistant/admin
- `passwordHash`: Hashed password

### Vehicles Collection
- `_id`: Vehicle ID
- `vehicleNo`: Vehicle number
- `vehicleType`: Type of vehicle
- `entryTime`: Entry timestamp
- `exitTime`: Exit timestamp (null if still parked)
- `status`: parked/left
- `allowedBy`: Assistant ID who allowed entry
- `billAmount`: Calculated bill amount

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Set up MySQL database
5. Run migrations
6. Start the server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Admin Routes
- `GET /api/admin/vehicles` - Get all parked vehicles
- `GET /api/admin/vehicles/exited` - Get all exited vehicles

### Assistant Routes
- `POST /api/assistant/vehicle/entry` - Register vehicle entry
- `POST /api/assistant/vehicle/exit` - Mark vehicle as exited
- `GET /api/assistant/vehicles` - Get assistant's entries

### Search Routes
- `GET /api/search/vehicles` - Search vehicles

## Billing
- Rate: ₹10 per minute
- Calculated at vehicle exit
- Formula: (exitTime - entryTime) / 60 * 10

## License
ISC
