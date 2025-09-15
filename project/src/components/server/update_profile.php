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
    $name = $input['name'];
    $email = $input['email'];
    $profileImage = isset($input['profileImage']) ? $input['profileImage'] : null;
    
    // Create MongoDB ObjectId from string ID
    $objectId = createObjectId($id);
    if (!$objectId) {
        echo json_encode(["success" => false, "message" => "Invalid user ID format"]);
        exit;
    }
    
    // Prepare update data
    $updateData = [
        'name' => $name,
        'email' => $email,
        'updated_at' => new MongoDB\BSON\UTCDateTime()
    ];
    
    // Add profile image if provided
    if ($profileImage) {
        // Check if the profile image is too large
        if (strlen($profileImage) > 1000000) { // 1MB limit
            // Compress the image by removing the header and re-encoding
            $imageData = explode(',', $profileImage, 2)[1];
            $decodedImage = base64_decode($imageData);
            
            // Create image from string
            $image = imagecreatefromstring($decodedImage);
            if ($image !== false) {
                // Start output buffering
                ob_start();
                // Output image as JPEG with 80% quality
                imagejpeg($image, null, 80);
                // Get the compressed image data
                $compressedImage = ob_get_clean();
                // Convert back to base64
                $compressedBase64 = 'data:image/jpeg;base64,' . base64_encode($compressedImage);
                $updateData['profileImage'] = $compressedBase64;
                // Free memory
                imagedestroy($image);
            } else {
                // If image creation fails, use original but truncate if needed
                $updateData['profileImage'] = substr($profileImage, 0, 1000000);
            }
        } else {
            $updateData['profileImage'] = $profileImage;
        }
    }
    
    // Check if user exists
    $user = $collection->findOne(['_id' => $objectId]);
    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }
    
    // Update user profile
    $updateResult = $collection->updateOne(
        ['_id' => $objectId],
        ['$set' => $updateData]
    );
    
    if ($updateResult->getModifiedCount() > 0 || $updateResult->getMatchedCount() > 0) {
        // Get updated user data
        $updatedUser = $collection->findOne(['_id' => $objectId]);
        $updatedUser = prepareMongoDocumentForJson($updatedUser);
        
        echo json_encode([
            "success" => true, 
            "message" => "Profile updated successfully",
            "user" => $updatedUser
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating profile or no changes made"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]);
}
?>