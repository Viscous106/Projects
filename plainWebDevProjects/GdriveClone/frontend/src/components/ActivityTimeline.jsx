import React, { useState, useEffect } from 'react';
import { Clock, Upload, Download, Trash2, Share2, Star, Edit3, MessageSquare, X } from 'lucide-react';
import { activityAPI } from '../services/api';
import './ActivityTimeline.css';

const ActivityTimeline = ({ fileId, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileId) {
      loadActivities();
    }
  }, [fileId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, use file activity - can be enhanced to use timeline endpoint
      const data = await activityAPI.getFileActivity(fileId);
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activity timeline');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return <Upload size={16} />;
      case 'download':
        return <Download size={16} />;
      case 'delete':
        return <Trash2 size={16} />;
      case 'restore':
        return <Upload size={16} />;
      case 'share':
      case 'unshare':
        return <Share2 size={16} />;
      case 'star':
      case 'unstar':
        return <Star size={16} />;
      case 'rename':
      case 'move':
        return <Edit3 size={16} />;
      case 'comment':
        return <MessageSquare size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'upload':
        return 'Uploaded';
      case 'download':
        return 'Downloaded';
      case 'delete':
        return 'Deleted';
      case 'restore':
        return 'Restored';
      case 'share':
        return 'Shared';
      case 'unshare':
        return 'Unshared';
      case 'star':
        return 'Starred';
      case 'unstar':
        return 'Unstarred';
      case 'rename':
        return 'Renamed';
      case 'move':
        return 'Moved';
      case 'comment':
        return 'Commented';
      default:
        return type;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-timeline">
        <div className="timeline-loading">
          <div className="spinner"></div>
          <p>Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-timeline">
        <div className="timeline-error">
          <p>{error}</p>
          <button onClick={loadActivities} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      <div className="timeline-header">
        <h3>Activity Timeline</h3>
        {onClose && (
          <button onClick={onClose} className="timeline-close-btn">
            <X size={20} />
          </button>
        )}
      </div>
      <div className="timeline-content">
        {activities.length === 0 ? (
          <div className="timeline-empty">
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="timeline-list">
            {activities.map((activity) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-icon">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="timeline-content-item">
                  <div className="timeline-text">
                    <span className="user-name">{activity.user_name || 'You'}</span>
                    {' '}
                    <span className="activity-action">{getActivityLabel(activity.activity_type)}</span>
                    {' '}
                    {activity.file_name && (
                      <span className="file-name">{activity.file_name}</span>
                    )}
                  </div>
                  <div className="timeline-time">{formatTime(activity.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;

