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
$id = $input['id'];
$name = $input['name'];
$email = $input['email'];
$role = $input['role'];
$status = $input['status'];
$user_password = $input['password'];

$sql = "UPDATE users SET name = ?, email = ?, role = ?, status = ?, password = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssi", $name, $email, $role, $status, $user_password, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating user"]);
}

$conn->close();
?>