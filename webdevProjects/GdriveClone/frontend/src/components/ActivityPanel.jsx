import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import {
  Upload, Trash2, RefreshCcw, Share2, UserX,
  FileText, FolderOpen, Star, StarOff, Download
} from 'lucide-react';

const ActivityPanel = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityAPI.getUserActivity(50);
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'upload':
        return <Upload className={`${iconClass} text-blue-600`} />;
      case 'delete':
        return <Trash2 className={`${iconClass} text-red-600`} />;
      case 'restore':
        return <RefreshCcw className={`${iconClass} text-green-600`} />;
      case 'share':
        return <Share2 className={`${iconClass} text-purple-600`} />;
      case 'unshare':
        return <UserX className={`${iconClass} text-gray-600`} />;
      case 'rename':
        return <FileText className={`${iconClass} text-orange-600`} />;
      case 'move':
        return <FolderOpen className={`${iconClass} text-yellow-600`} />;
      case 'star':
        return <Star className={`${iconClass} text-yellow-500`} />;
      case 'unstar':
        return <StarOff className={`${iconClass} text-gray-600`} />;
      case 'download':
        return <Download className={`${iconClass} text-teal-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  const getActivityDescription = (activity) => {
    const fileName = activity.file_name || 'Unknown file';
    switch (activity.activity_type) {
      case 'upload':
        return `Uploaded ${fileName}`;
      case 'delete':
        return `Moved ${fileName} to trash`;
      case 'restore':
        return `Restored ${fileName}`;
      case 'share':
        return `Shared ${fileName}`;
      case 'unshare':
        return `Stopped sharing ${fileName}`;
      case 'rename':
        return `Renamed ${fileName}`;
      case 'move':
        return `Moved ${fileName}`;
      case 'star':
        return `Starred ${fileName}`;
      case 'unstar':
        return `Unstarred ${fileName}`;
      case 'download':
        return `Downloaded ${fileName}`;
      default:
        return `Modified ${fileName}`;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupActivitiesByDate = (activities) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      activityDate.setHours(0, 0, 0, 0);

      if (activityDate.getTime() === today.getTime()) {
        groups.today.push(activity);
      } else if (activityDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(activity);
      } else {
        groups.earlier.push(activity);
      }
    });

    return groups;
  };

  if (!isOpen) return null;

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading activities...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="w-12 h-12 mb-2 opacity-50" />
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Today */}
            {groupedActivities.today.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Today</h3>
                <div className="space-y-3">
                  {groupedActivities.today.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedActivities.yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Yesterday</h3>
                <div className="space-y-3">
                  {groupedActivities.yesterday.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Earlier */}
            {groupedActivities.earlier.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Earlier</h3>
                <div className="space-y-3">
                  {groupedActivities.earlier.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
