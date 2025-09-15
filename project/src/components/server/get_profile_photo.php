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

// Check if email is provided
if (!isset($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$email = $data['email'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Generate the expected filename based on email
$assetsDir = __DIR__ . '/../../assets/profile_photos';
$md5Email = md5($email);

// Check for any file with this email hash
$files = glob($assetsDir . '/' . $md5Email . '.*');

if (!empty($files)) {
    // Get the first matching file
    $filePath = $files[0];
    $fileName = basename($filePath);
    $photoUrl = '/assets/profile_photos/' . $fileName;
    
    echo json_encode([
        'success' => true,
        'photoUrl' => $photoUrl
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No profile photo found for this email'
    ]);
}
?>