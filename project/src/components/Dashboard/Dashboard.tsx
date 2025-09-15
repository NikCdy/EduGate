import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Target, TrendingUp, Plus, Trash2, Activity, Search, FileText, Video, Award } from 'lucide-react';

interface LearningGoal {
  id: string;
  title: string;
  progress: number;
  dueDate: string;
  createdAt: string;
  lastUpdated: string;
}

interface ActivityLog {
  id: string;
  type: 'goal_created' | 'goal_updated' | 'goal_completed' | 'search_performed' | 'note_created' | 'video_watched';
  description: string;
  timestamp: string;
}

interface UserStats {
  totalSearches: number;
  notesCreated: number;
  videosWatched: number;
  papersRead: number;
  studyStreak: number;
  totalStudyTime: number;
}

const Dashboard: React.FC = () => {
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', dueDate: '' });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSearches: 0,
    notesCreated: 0,
    videosWatched: 0,
    papersRead: 0,
    studyStreak: 0,
    totalStudyTime: 0
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || localStorage.getItem('adminName') || 'User';
    setUserName(savedName);
    
    const savedGoals = localStorage.getItem(`learningGoals_${savedName}`);
    const savedActivity = localStorage.getItem(`activityLog_${savedName}`);
    const savedStats = localStorage.getItem(`userStats_${savedName}`);
    
    if (savedGoals) {
      setLearningGoals(JSON.parse(savedGoals));
    } else {
      const defaultGoals = [
        { id: '1', title: 'Complete React Course', progress: 75, dueDate: '2024-12-31', createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() },
        { id: '2', title: 'Learn TypeScript', progress: 45, dueDate: '2024-11-30', createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() },
        { id: '3', title: 'Master Node.js', progress: 20, dueDate: '2025-01-15', createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() }
      ];
      setLearningGoals(defaultGoals);
      localStorage.setItem(`learningGoals_${savedName}`, JSON.stringify(defaultGoals));
    }
    
    if (savedActivity) {
      setActivityLog(JSON.parse(savedActivity));
    } else {
      const defaultActivity = [
        { id: '1', type: 'goal_created', description: 'Created goal: Complete React Course', timestamp: new Date().toISOString() },
        { id: '2', type: 'search_performed', description: 'Searched for React tutorials', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ];
      setActivityLog(defaultActivity);
      localStorage.setItem(`activityLog_${savedName}`, JSON.stringify(defaultActivity));
    }
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    } else {
      const defaultStats = {
        totalSearches: 15,
        notesCreated: 8,
        videosWatched: 12,
        papersRead: 5,
        studyStreak: 7,
        totalStudyTime: 45
      };
      setUserStats(defaultStats);
      localStorage.setItem(`userStats_${savedName}`, JSON.stringify(defaultStats));
    }
  }, []);

  const addGoal = () => {
    if (newGoal.title && newGoal.dueDate) {
      const goal: LearningGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        progress: 0,
        dueDate: newGoal.dueDate,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      const updatedGoals = [...learningGoals, goal];
      setLearningGoals(updatedGoals);
      localStorage.setItem(`learningGoals_${userName}`, JSON.stringify(updatedGoals));
      
      const activity: ActivityLog = {
        id: Date.now().toString(),
        type: 'goal_created',
        description: `Created goal: ${newGoal.title}`,
        timestamp: new Date().toISOString()
      };
      const updatedActivity = [activity, ...activityLog].slice(0, 20);
      setActivityLog(updatedActivity);
      localStorage.setItem(`activityLog_${userName}`, JSON.stringify(updatedActivity));
      
      setNewGoal({ title: '', dueDate: '' });
      setShowAddGoal(false);
    }
  };

  const updateProgress = (id: string, progress: number) => {
    const updatedGoals = learningGoals.map(goal => {
      if (goal.id === id) {
        const updatedGoal = { ...goal, progress, lastUpdated: new Date().toISOString() };
        
        const activity: ActivityLog = {
          id: Date.now().toString(),
          type: progress === 100 ? 'goal_completed' : 'goal_updated',
          description: progress === 100 ? `Completed goal: ${goal.title}` : `Updated progress for: ${goal.title} (${progress}%)`,
          timestamp: new Date().toISOString()
        };
        const updatedActivity = [activity, ...activityLog].slice(0, 20);
        setActivityLog(updatedActivity);
        localStorage.setItem(`activityLog_${userName}`, JSON.stringify(updatedActivity));
        
        return updatedGoal;
      }
      return goal;
    });
    setLearningGoals(updatedGoals);
    localStorage.setItem(`learningGoals_${userName}`, JSON.stringify(updatedGoals));
  };

  const deleteGoal = (id: string) => {
    const goalToDelete = learningGoals.find(goal => goal.id === id);
    const updatedGoals = learningGoals.filter(goal => goal.id !== id);
    setLearningGoals(updatedGoals);
    localStorage.setItem(`learningGoals_${userName}`, JSON.stringify(updatedGoals));
    
    if (goalToDelete) {
      const activity: ActivityLog = {
        id: Date.now().toString(),
        type: 'goal_updated',
        description: `Deleted goal: ${goalToDelete.title}`,
        timestamp: new Date().toISOString()
      };
      const updatedActivity = [activity, ...activityLog].slice(0, 20);
      setActivityLog(updatedActivity);
      localStorage.setItem(`activityLog_${userName}`, JSON.stringify(updatedActivity));
    }
  };

  const averageProgress = learningGoals.length > 0 
    ? Math.round(learningGoals.reduce((sum, goal) => sum + goal.progress, 0) / learningGoals.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
        <p className="text-gray-600">Track your progress and manage your learning goals</p>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">Searches</p>
              <p className="text-xl font-bold text-blue-700">{userStats.totalSearches}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Notes</p>
              <p className="text-xl font-bold text-green-700">{userStats.notesCreated}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-600">Videos</p>
              <p className="text-xl font-bold text-purple-700">{userStats.videosWatched}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-600">Streak</p>
              <p className="text-xl font-bold text-orange-700">{userStats.studyStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">Active Goals</p>
              <p className="text-2xl font-bold text-blue-700">{learningGoals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Completed Goals</p>
              <p className="text-2xl font-bold text-green-700">
                {learningGoals.filter(goal => goal.progress === 100).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-600">Average Progress</p>
              <p className="text-2xl font-bold text-purple-700">{averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Goals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Learning Goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </button>
              </div>
            </div>

            <div className="p-6">
              {learningGoals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No learning goals yet. Add your first goal to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningGoals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">{goal.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Due: {goal.dueDate}</span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {activityLog.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityLog.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'goal_completed' ? 'bg-green-500' :
                      activity.type === 'goal_created' ? 'bg-blue-500' :
                      activity.type === 'goal_updated' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Learning Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Complete Python Course"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoal({ title: '', dueDate: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;