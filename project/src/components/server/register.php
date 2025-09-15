<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Include MongoDB connection helper
require_once 'mongodb_connect.php';

try {
    // Get MongoDB collection
    $collection = getMongoDBCollection('users');
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'];
    $name = $input['name'];
    $email = $input['email'];
    $password = $input['password'];
    
    // Check if user already exists
    $existingUser = $collection->findOne([
        '$or' => [
            ['email' => $email],
            ['name' => $username]
        ]
    ]);
    
    if ($existingUser) {
        echo json_encode(["success" => false, "message" => "User with this email or username already exists"]);
    } else {
        // Insert new user
        $result = $collection->insertOne([
            'name' => $name,
            'email' => $email,
            'role' => 'user',
            'status' => 'active',
            'password' => $password,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ]);
        
        if ($result->getInsertedCount() > 0) {
            echo json_encode(["success" => true, "message" => "User registered successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error registering user"]);
        }
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
}
?>