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
    $password = $input['password'];
    
    // Find user by username or email and active status
    $user = $collection->findOne([
        '$or' => [
            ['name' => $username],
            ['email' => $username]
        ],
        'status' => 'active'
    ]);
    
    if ($user) {
        // Check password
        if ($user['password'] === $password) {
            // Prepare document for JSON response
            $user = prepareMongoDocumentForJson($user);
            echo json_encode(["success" => true, "user" => $user]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
}
?>