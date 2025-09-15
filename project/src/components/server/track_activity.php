<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Include MongoDB connection helper
require_once 'mongodb_connect.php';

try {
    // Get MongoDB collection for activity tracking
    $collection = getMongoDBCollection('activity_logs');
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $type = $input['type']; // 'login', 'register', 'search'
    $userId = isset($input['userId']) ? $input['userId'] : null;
    $details = isset($input['details']) ? $input['details'] : null;
    
    // Create activity log
    $activityLog = [
        'type' => $type,
        'userId' => $userId,
        'details' => $details,
        'timestamp' => new MongoDB\BSON\UTCDateTime(),
        'ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    // Insert activity log
    $result = $collection->insertOne($activityLog);
    
    // Update statistics collection for quick access to aggregated data
    $statsCollection = getMongoDBCollection('statistics');
    
    // Get current date (YYYY-MM-DD format)
    $today = date('Y-m-d');
    
    // Update daily statistics
    $statsCollection->updateOne(
        ['date' => $today],
        [
            '$inc' => ["counts.{$type}" => 1],
            '$setOnInsert' => ['created_at' => new MongoDB\BSON\UTCDateTime()]
        ],
        ['upsert' => true]
    );
    
    if ($result->getInsertedCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Activity logged successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to log activity"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>