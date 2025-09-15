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
    $id = $input['id'];
    $currentPassword = $input['currentPassword'];
    $newPassword = $input['newPassword'];
    
    // Create MongoDB ObjectId from string ID
    $objectId = createObjectId($id);
    if (!$objectId) {
        echo json_encode(["success" => false, "message" => "Invalid user ID format"]);
        exit;
    }
    
    // Verify current password
    $user = $collection->findOne(['_id' => $objectId]);
    
    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }
    
    if ($user['password'] !== $currentPassword) {
        echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
        exit;
    }
    
    // Update password
    $updateResult = $collection->updateOne(
        ['_id' => $objectId],
        ['$set' => [
            'password' => $newPassword,
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ]]
    );
    
    if ($updateResult->getModifiedCount() > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Password updated successfully"
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating password or no changes made"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
}
?>