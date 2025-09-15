<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Include MongoDB connection helper
require_once 'mongodb_connect.php';

try {
    // Get MongoDB collections
    $activityCollection = getMongoDBCollection('activity_logs');
    $usersCollection = getMongoDBCollection('users');
    
    // Get current date and time
    $now = new MongoDB\BSON\UTCDateTime();
    
    // Calculate date 6 months ago
    $sixMonthsAgo = new MongoDB\BSON\UTCDateTime((time() - (6 * 30 * 24 * 60 * 60)) * 1000);
    
    // Get monthly registrations
    $monthlyRegistrations = [];
    $registrationPipeline = [
        [
            '$match' => [
                'type' => 'register',
                'timestamp' => ['$gte' => $sixMonthsAgo]
            ]
        ],
        [
            '$group' => [
                '_id' => [
                    'year' => ['$year' => '$timestamp'],
                    'month' => ['$month' => '$timestamp']
                ],
                'count' => ['$sum' => 1]
            ]
        ],
        ['$sort' => ['_id.year' => 1, '_id.month' => 1]]
    ];
    
    $registrationResults = $activityCollection->aggregate($registrationPipeline);
    foreach ($registrationResults as $result) {
        $monthName = date('M', mktime(0, 0, 0, $result->_id['month'], 1, $result->_id['year']));
        $monthlyRegistrations[$monthName] = $result->count;
    }
    
    // Get monthly logins
    $monthlyLogins = [];
    $loginPipeline = [
        [
            '$match' => [
                'type' => 'login',
                'timestamp' => ['$gte' => $sixMonthsAgo]
            ]
        ],
        [
            '$group' => [
                '_id' => [
                    'year' => ['$year' => '$timestamp'],
                    'month' => ['$month' => '$timestamp']
                ],
                'count' => ['$sum' => 1]
            ]
        ],
        ['$sort' => ['_id.year' => 1, '_id.month' => 1]]
    ];
    
    $loginResults = $activityCollection->aggregate($loginPipeline);
    foreach ($loginResults as $result) {
        $monthName = date('M', mktime(0, 0, 0, $result->_id['month'], 1, $result->_id['year']));
        $monthlyLogins[$monthName] = $result->count;
    }
    
    // Get top search terms
    $searchPipeline = [
        [
            '$match' => [
                'type' => 'search'
            ]
        ],
        [
            '$group' => [
                '_id' => '$details.term',
                'count' => ['$sum' => 1]
            ]
        ],
        ['$sort' => ['count' => -1]],
        ['$limit' => 5]
    ];
    
    $searchResults = $activityCollection->aggregate($searchPipeline);
    $topSearches = [];
    foreach ($searchResults as $result) {
        $topSearches[] = [
            'term' => $result->_id,
            'count' => $result->count
        ];
    }
    
    // Get user types
    $userTypesPipeline = [
        [
            '$group' => [
                '_id' => '$role',
                'count' => ['$sum' => 1]
            ]
        ]
    ];
    
    $userTypesResults = $usersCollection->aggregate($userTypesPipeline);
    $userTypes = [];
    foreach ($userTypesResults as $result) {
        $userTypes[] = [
            'name' => $result->_id,
            'value' => $result->count
        ];
    }
    
    // Prepare monthly data for charts
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $currentMonth = (int)date('m');
    $currentYear = (int)date('Y');
    
    $chartData = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = $currentMonth - $i;
        $year = $currentYear;
        
        if ($month <= 0) {
            $month += 12;
            $year -= 1;
        }
        
        $monthName = $months[$month - 1];
        $chartData[] = [
            'month' => $monthName,
            'registrations' => isset($monthlyRegistrations[$monthName]) ? $monthlyRegistrations[$monthName] : 0,
            'logins' => isset($monthlyLogins[$monthName]) ? $monthlyLogins[$monthName] : 0
        ];
    }
    
    // Get total counts
    $totalRegistrations = $activityCollection->countDocuments(['type' => 'register']);
    $totalLogins = $activityCollection->countDocuments(['type' => 'login']);
    $totalSearches = $activityCollection->countDocuments(['type' => 'search']);
    $activeUsers = $usersCollection->countDocuments(['status' => 'active']);
    
    // Return all stats
    echo json_encode([
        'success' => true,
        'userStats' => $chartData,
        'searchStats' => $topSearches,
        'userTypes' => $userTypes,
        'totals' => [
            'registrations' => $totalRegistrations,
            'logins' => $totalLogins,
            'searches' => $totalSearches,
            'activeUsers' => $activeUsers
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>