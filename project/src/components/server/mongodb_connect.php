<?php
// MongoDB connection helper

require 'vendor/autoload.php'; // Include Composer autoloader

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

/**
 * Get MongoDB connection
 * 
 * @param string $collection Collection name
 * @return MongoDB\Collection
 */
function getMongoDBCollection($collection = 'users') {
    $mongoClient = new Client("mongodb://localhost:27017");
    return $mongoClient->edugate->$collection;
}

/**
 * Convert MongoDB document for JSON response
 * 
 * @param array $document MongoDB document
 * @return array Modified document
 */
function prepareMongoDocumentForJson($document) {
    if (!$document) return null;
    
    // Convert MongoDB _id to string
    $document['_id'] = (string)$document['_id'];
    
    // Add id field for compatibility with existing code
    $document['id'] = $document['_id'];
    
    return $document;
}

/**
 * Create MongoDB ObjectId from string
 * 
 * @param string $id String ID
 * @return MongoDB\BSON\ObjectId|null ObjectId or null if invalid
 */
function createObjectId($id) {
    try {
        return new ObjectId($id);
    } catch (Exception $e) {
        return null;
    }
}
?>