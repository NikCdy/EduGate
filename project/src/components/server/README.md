# MongoDB PHP Integration

This directory contains PHP files that have been migrated from MySQL to MongoDB.

## Setup Instructions

1. Install PHP MongoDB extension:
   ```
   pecl install mongodb
   ```

2. Add the extension to your php.ini file:
   ```
   extension=mongodb.so  # For Linux/Mac
   extension=mongodb.dll # For Windows
   ```

3. Install Composer dependencies:
   ```
   composer install
   ```

## File Structure

- `mongodb_connect.php` - Helper functions for MongoDB connection
- `*.php` - API endpoints that use MongoDB
- `composer.json` - Dependency configuration

## MongoDB Connection

The connection to MongoDB is established using the MongoDB PHP library. The default connection string is:

```
mongodb://localhost:27017
```

The database name is `edugate`.

## Data Structure

The MongoDB database uses the following collections:

- `users` - User accounts with fields:
  - `_id` - MongoDB ObjectId
  - `name` - User's name
  - `email` - User's email address
  - `role` - User role ('admin' or 'user')
  - `status` - User status ('active' or 'inactive')
  - `password` - User's password
  - `created_at` - Creation timestamp
  - `updated_at` - Last update timestamp

## API Endpoints

- `login.php` - User authentication
- `register.php` - User registration
- `get_user_profile.php` - Get user profile data
- `update_profile.php` - Update user profile

## Compatibility

These files maintain compatibility with the frontend by:
1. Converting MongoDB ObjectId to string
2. Adding an `id` field that matches the `_id` field
3. Maintaining the same API response structure