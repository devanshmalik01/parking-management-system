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
