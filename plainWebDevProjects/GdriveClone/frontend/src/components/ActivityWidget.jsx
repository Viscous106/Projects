import React, { useState, useEffect } from 'react';
import { Clock, Upload, Download, Share2, MessageSquare, ChevronRight } from 'lucide-react';
import { activityAPI } from '../services/api';
import './ActivityWidget.css';

const ActivityWidget = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const data = await activityAPI.getDashboardActivity(5);
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load dashboard activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return <Upload size={14} />;
      case 'download':
        return <Download size={14} />;
      case 'share':
        return <Share2 size={14} />;
      case 'comment':
        return <MessageSquare size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getActivityText = (activity) => {
    const userName = activity.user_name || 'You';
    const fileName = activity.file_name || 'a file';
    
    switch (activity.activity_type) {
      case 'upload':
        return `${userName} uploaded ${fileName}`;
      case 'download':
        return `${userName} downloaded ${fileName}`;
      case 'share':
        return `${userName} shared ${fileName}`;
      case 'comment':
        return `${userName} commented on ${fileName}`;
      default:
        return `${userName} ${activity.activity_type} ${fileName}`;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-widget">
        <div className="widget-header">
          <Clock size={18} />
          <span>Recent Activity</span>
        </div>
        <div className="widget-loading">
          <div className="spinner-small"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-widget">
      <div className="widget-header">
        <Clock size={18} />
        <span>Recent Activity</span>
      </div>
      <div className="widget-content">
        {activities.length === 0 ? (
          <div className="widget-empty">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="widget-list">
            {activities.map((activity) => (
              <div key={activity.id} className="widget-item">
                <div className="widget-icon">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="widget-text">
                  <div className="widget-activity-text">{getActivityText(activity)}</div>
                  <div className="widget-time">{formatTime(activity.created_at)}</div>
                </div>
                <ChevronRight size={14} className="widget-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityWidget;

