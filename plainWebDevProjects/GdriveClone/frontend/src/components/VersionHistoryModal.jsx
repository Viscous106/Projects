import React, { useState, useEffect } from 'react';
import { versionsAPI, filesAPI } from '../services/api';
import { Clock, Download, User, HardDrive } from 'lucide-react';

const VersionHistoryModal = ({ isOpen, onClose, file }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadVersions();
    }
  }, [isOpen, file]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await versionsAPI.getFileVersions(file.id);
      setVersions(data || []);
    } catch (err) {
      console.error('Failed to load versions:', err);
      setError('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVersion = async (versionId, fileName) => {
    try {
      // For now, download the current file
      // In a full implementation, you'd have a specific endpoint to download a version
      const blob = await filesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download version:', err);
      alert('Failed to download version');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen || !file) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-500 mt-1">{file.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading version history...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Clock className="w-12 h-12 mb-2 opacity-50" />
                <p>No version history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Version number badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                          index === 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          v{version.version_number}
                        </div>
                      </div>

                      {/* Version details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {formatDate(version.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {version.uploader_name && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1.5" />
                              <span>{version.uploader_name}</span>
                              {version.uploader_email && (
                                <span className="text-gray-400 ml-1">({version.uploader_email})</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center">
                            <HardDrive className="w-4 h-4 mr-1.5" />
                            <span>{formatFileSize(version.size)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadVersion(version.id, file.name)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Download this version"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {index !== 0 && (
                          <button
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Restore this version"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VersionHistoryModal;
