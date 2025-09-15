<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Include MongoDB connection helper
require_once 'mongodb_connect.php';

try {
    // Get MongoDB collection
    $collection = getMongoDBCollection('notes');
    
    // Handle different HTTP methods
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get user ID from query parameters
            $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
            
            if (!$userId) {
                echo json_encode([
                    "success" => false,
                    "message" => "User ID is required"
                ]);
                exit;
            }
            
            // Find notes for this user
            $notes = $collection->find(['userId' => $userId]);
            $notesList = [];
            
            foreach ($notes as $note) {
                $notesList[] = prepareMongoDocumentForJson($note);
            }
            
            echo json_encode([
                "success" => true,
                "notes" => $notesList
            ]);
            break;
            
        case 'POST':
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['userId'];
            $title = isset($input['title']) ? $input['title'] : 'Untitled Note';
            $content = $input['content'];
            
            // Create note document
            $note = [
                'userId' => $userId,
                'title' => $title,
                'content' => $content,
                'created_at' => new MongoDB\BSON\UTCDateTime(),
                'updated_at' => new MongoDB\BSON\UTCDateTime()
            ];
            
            // Insert note
            $result = $collection->insertOne($note);
            
            if ($result->getInsertedCount() > 0) {
                $insertedNote = prepareMongoDocumentForJson($note);
                $insertedNote['_id'] = (string)$result->getInsertedId();
                
                echo json_encode([
                    "success" => true,
                    "message" => "Note created successfully",
                    "note" => $insertedNote
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to create note"
                ]);
            }
            break;
            
        case 'PUT':
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            $noteId = $input['id'];
            $title = isset($input['title']) ? $input['title'] : null;
            $content = isset($input['content']) ? $input['content'] : null;
            
            // Create MongoDB ObjectId from string ID
            $objectId = createObjectId($noteId);
            if (!$objectId) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid note ID format"
                ]);
                exit;
            }
            
            // Prepare update data
            $updateData = [
                'updated_at' => new MongoDB\BSON\UTCDateTime()
            ];
            
            if ($title !== null) {
                $updateData['title'] = $title;
            }
            
            if ($content !== null) {
                $updateData['content'] = $content;
            }
            
            // Update note
            $result = $collection->updateOne(
                ['_id' => $objectId],
                ['$set' => $updateData]
            );
            
            if ($result->getModifiedCount() > 0 || $result->getMatchedCount() > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Note updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Note not found or no changes made"
                ]);
            }
            break;
            
        case 'DELETE':
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            $noteId = $input['id'];
            
            // Create MongoDB ObjectId from string ID
            $objectId = createObjectId($noteId);
            if (!$objectId) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid note ID format"
                ]);
                exit;
            }
            
            // Delete note
            $result = $collection->deleteOne(['_id' => $objectId]);
            
            if ($result->getDeletedCount() > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Note deleted successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Note not found"
                ]);
            }
            break;
            
        default:
            echo json_encode([
                "success" => false,
                "message" => "Unsupported request method"
            ]);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>