<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Mock search results for demonstration
$mockResults = [
    [
        'id' => 1,
        'title' => 'Introduction to Python Programming',
        'description' => 'Learn the basics of Python programming language with hands-on examples.',
        'type' => 'Course',
        'url' => '/courses/python-intro'
    ],
    [
        'id' => 2,
        'title' => 'Advanced JavaScript Techniques',
        'description' => 'Master advanced JavaScript concepts including closures, promises, and async/await.',
        'type' => 'Course',
        'url' => '/courses/advanced-js'
    ],
    [
        'id' => 3,
        'title' => 'Machine Learning Fundamentals',
        'description' => 'Understand the core concepts of machine learning and AI.',
        'type' => 'Course',
        'url' => '/courses/ml-fundamentals'
    ],
    [
        'id' => 4,
        'title' => 'Data Science with Python',
        'description' => 'Learn how to analyze and visualize data using Python libraries.',
        'type' => 'Course',
        'url' => '/courses/data-science-python'
    ],
    [
        'id' => 5,
        'title' => 'Web Development with React',
        'description' => 'Build modern web applications using React and related technologies.',
        'type' => 'Course',
        'url' => '/courses/react-web-dev'
    ],
    [
        'id' => 6,
        'title' => 'Python for Data Analysis',
        'description' => 'Use Python libraries like Pandas and NumPy for data analysis.',
        'type' => 'Resource',
        'url' => '/resources/python-data-analysis'
    ],
    [
        'id' => 7,
        'title' => 'JavaScript: The Good Parts',
        'description' => 'A guide to the best practices in JavaScript programming.',
        'type' => 'Book',
        'url' => '/books/javascript-good-parts'
    ]
];

// Get search query
$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    echo json_encode([
        'success' => false,
        'message' => 'No search query provided',
        'results' => []
    ]);
    exit;
}

// Filter results based on query
$results = [];
foreach ($mockResults as $result) {
    if (stripos($result['title'], $query) !== false || 
        stripos($result['description'], $query) !== false ||
        stripos($result['type'], $query) !== false) {
        $results[] = $result;
    }
}

// Return results
echo json_encode([
    'success' => true,
    'query' => $query,
    'results' => $results
]);
?>