CREATE DATABASE IF NOT EXISTS edugate;
USE edugate;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, role, status, password) VALUES
('John Doe', 'john@example.com', 'user', 'active', 'user123'),
('Jane Smith', 'jane@example.com', 'admin', 'active', 'admin123'),
('Bob Johnson', 'bob@example.com', 'user', 'inactive', 'user123'),
('Shyam Chaudhary', 'test@gmail.com', 'admin', 'active', 'admin@1234');