<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "edugate";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

$input = json_decode(file_get_contents('php://input'), true);
$login_username = $input['username'];
$login_password = $input['password'];

$sql = "SELECT * FROM users WHERE (name = ? OR email = ?) AND role = 'admin' AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $login_username, $login_username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($user['password'] === $login_password) {
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Admin user not found"]);
}

$conn->close();
?>