<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST method is allowed']);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Check if required fields are present
if (!isset($data['email']) || !isset($data['imageData'])) {
    echo json_encode(['success' => false, 'message' => 'Email and image data are required']);
    exit;
}

$email = $data['email'];
$name = isset($data['name']) ? $data['name'] : '';
$imageData = $data['imageData'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Extract image data from base64 string
if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
    $imageType = $matches[1];
    $imageData = substr($imageData, strpos($imageData, ',') + 1);
    $imageData = base64_decode($imageData);
    
    if ($imageData === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid image data']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid image format']);
    exit;
}

// Create assets directory if it doesn't exist
$assetsDir = __DIR__ . '/../../assets/profile_photos';
if (!file_exists($assetsDir)) {
    mkdir($assetsDir, 0755, true);
}

// Generate a unique filename based on email
$filename = md5($email) . '.' . $imageType;
$filePath = $assetsDir . '/' . $filename;

// Save the image
if (file_put_contents($filePath, $imageData)) {
    // Update user record in database if needed
    // For now, we'll just return the URL
    $photoUrl = '/assets/profile_photos/' . $filename;
    
    // Include MongoDB connection helper if needed
    // require_once 'mongodb_connect.php';
    // Update user profile in database
    
    echo json_encode([
        'success' => true, 
        'message' => 'Profile photo uploaded successfully',
        'photoUrl' => $photoUrl
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save image']);
}
?>