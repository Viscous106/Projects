import React, { useState, useEffect } from 'react';
import { HardDrive, FileText, Image, Film, Music, File, Archive, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { storageAPI } from '../services/api';
import './StorageAnalytics.css';

const StorageAnalytics = ({ onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storageAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load storage analytics:', err);
      setError('Failed to load storage analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'Images':
        return <Image size={20} />;
      case 'Videos':
        return <Film size={20} />;
      case 'Audio':
        return <Music size={20} />;
      case 'PDFs':
      case 'Documents':
        return <FileText size={20} />;
      case 'Archives':
        return <Archive size={20} />;
      default:
        return <File size={20} />;
    }
  };

  const getFileTypeColor = (fileType) => {
    const colors = {
      'Images': '#ea4335',
      'Videos': '#4285f4',
      'Audio': '#fbbc04',
      'PDFs': '#34a853',
      'Documents': '#5f6368',
      'Archives': '#9334e9',
      'Text Files': '#06b6d4',
      'Other': '#94a3b8'
    };
    return colors[fileType] || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="storage-analytics-overlay">
        <div className="storage-analytics-modal">
          <div className="storage-analytics-loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storage-analytics-overlay">
        <div className="storage-analytics-modal">
          <div className="storage-analytics-error">
            <p>{error}</p>
            <button onClick={loadAnalytics} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = (analytics.storage_used / analytics.storage_limit) * 100;
  const isNearLimit = usagePercentage > 80;
  const isFull = usagePercentage >= 100;

  return (
    <div className="storage-analytics-overlay" onClick={onClose}>
      <div className="storage-analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="storage-analytics-header">
          <div className="storage-header-title">
            <HardDrive size={24} />
            <h2>Storage Analytics</h2>
          </div>
          <button onClick={onClose} className="storage-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="storage-analytics-content">
          {/* Storage Summary */}
          <div className="storage-summary">
            <div className="storage-summary-header">
              <h3>Storage Usage</h3>
              <span className={`storage-percentage ${isNearLimit ? 'warning' : ''} ${isFull ? 'danger' : ''}`}>
                {usagePercentage.toFixed(1)}% used
              </span>
            </div>

            <div className="storage-progress-container">
              <div className="storage-progress-bar">
                <div
                  className={`storage-progress-fill ${isNearLimit ? 'warning' : ''} ${isFull ? 'danger' : ''}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <div className="storage-numbers">
                <span className="storage-used">{formatBytes(analytics.storage_used)} used</span>
                <span className="storage-total">of {formatBytes(analytics.storage_limit)}</span>
              </div>
            </div>

            {isNearLimit && (
              <div className={`storage-warning ${isFull ? 'danger' : ''}`}>
                {isFull
                  ? '⚠️ Storage limit reached. Delete some files to free up space.'
                  : '⚠️ You are running low on storage space.'}
              </div>
            )}

            <div className="storage-stats-grid">
              <div className="storage-stat-card">
                <File size={24} />
                <div className="stat-info">
                  <span className="stat-value">{analytics.total_files.toLocaleString()}</span>
                  <span className="stat-label">Files</span>
                </div>
              </div>
              <div className="storage-stat-card">
                <HardDrive size={24} />
                <div className="stat-info">
                  <span className="stat-value">{analytics.total_folders.toLocaleString()}</span>
                  <span className="stat-label">Folders</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Type Breakdown */}
          {analytics.by_file_type && analytics.by_file_type.length > 0 && (
            <div className="file-type-breakdown">
              <h3>Storage by File Type</h3>

              {/* Pie Chart */}
              <div className="pie-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.by_file_type.map(type => ({
                        name: type.file_type,
                        value: type.total_size,
                        files: type.file_count,
                        percentage: type.percentage
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.by_file_type.map((type, index) => (
                        <Cell key={`cell-${index}`} fill={getFileTypeColor(type.file_type)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${formatBytes(value)} (${props.payload.percentage.toFixed(1)}%)`,
                        props.payload.name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Visual Chart (Backup bar chart) */}
              <div className="file-type-chart">
                {analytics.by_file_type.map((type, index) => (
                  <div
                    key={index}
                    className="chart-segment"
                    style={{
                      width: `${type.percentage}%`,
                      backgroundColor: getFileTypeColor(type.file_type)
                    }}
                    title={`${type.file_type}: ${formatBytes(type.total_size)} (${type.percentage.toFixed(1)}%)`}
                  />
                ))}
              </div>

              {/* Breakdown List */}
              <div className="file-type-list">
                {analytics.by_file_type.map((type, index) => (
                  <div key={index} className="file-type-item">
                    <div className="file-type-info">
                      <div
                        className="file-type-icon"
                        style={{ color: getFileTypeColor(type.file_type) }}
                      >
                        {getFileTypeIcon(type.file_type)}
                      </div>
                      <div className="file-type-details">
                        <span className="file-type-name">{type.file_type}</span>
                        <span className="file-type-count">{type.file_count.toLocaleString()} files</span>
                      </div>
                    </div>
                    <div className="file-type-size">
                      <span className="size-value">{formatBytes(type.total_size)}</span>
                      <span className="size-percentage">{type.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="storage-tips">
            <h3>💡 Storage Tips</h3>
            <ul>
              <li>Delete files you no longer need from the trash permanently</li>
              <li>Large video files take up the most space - consider compressing them</li>
              <li>Use external links instead of uploading large files when possible</li>
              <li>Regularly review and clean up old files to free up space</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAnalytics;
