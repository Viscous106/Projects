import React, { useState, useEffect } from 'react';
import { X, User, Calendar, HardDrive, FileText, Folder, Star, Clock } from 'lucide-react';

const DetailsPanel = ({ item, type, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If today, show time
    if (diffDays === 0) {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    // If this year, don't show year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Otherwise show full date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (type === 'file' && item.mime_type?.startsWith('image/')) {
      loadImagePreview();
    }
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [item?.id]);

  const loadImagePreview = async () => {
    if (!item?.id) return;
    setImageLoading(true);
    try {
      const response = await fetch(`http://localhost:1030/api/files/${item.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const getFileIcon = () => {
    if (type === 'folder') {
      return <Folder className="w-16 h-16 text-gray-400" />;
    }

    const mimeType = item.mime_type || '';
    if (mimeType.startsWith('image/')) {
      if (imageLoading) {
        return <div className="w-full h-64 bg-gray-100 animate-pulse flex items-center justify-center">Loading...</div>;
      }
      if (imageUrl) {
        return (
          <div className="w-full">
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full max-h-96 object-contain rounded"
            />
          </div>
        );
      }
      // Fallback to thumbnail if available
      if (item.thumbnail_path) {
        return (
          <img
            src={`http://localhost:1030/api/files/${item.id}/thumbnail`}
            alt={item.name}
            className="w-full max-h-96 object-contain rounded"
          />
        );
      }
      return <FileText className="w-16 h-16 text-blue-500 p-2" />;
    }

    return <FileText className="w-16 h-16 text-blue-500" />;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header with filename and tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {type === 'file' && item.mime_type?.startsWith('image/') && (
              <div className="w-6 h-6 flex-shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover rounded" />
                ) : item.thumbnail_path ? (
                  <img src={`http://localhost:1030/api/files/${item.id}/thumbnail`} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500" />
                )}
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
              {item.name || item.original_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            Details
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Preview/Icon - Full width for images */}
        {type === 'file' && item.mime_type?.startsWith('image/') ? (
          <div className="w-full bg-gray-50 p-4">
            {getFileIcon()}
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            {getFileIcon()}
            <h3 className="mt-4 text-sm font-medium text-gray-900 text-center break-all px-2">
              {item.name || item.original_name}
            </h3>
          </div>
        )}

        {/* Details Section */}
        <div className="p-4 space-y-4">
          {/* Type */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">Type</div>
            <div className="text-sm text-gray-900">
              {type === 'folder' ? 'Folder' : (item.mime_type || 'File')}
            </div>
          </div>

          {/* Size */}
          {type === 'file' && item.size !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center text-xs font-semibold text-gray-500 uppercase">
                <HardDrive className="w-3.5 h-3.5 mr-1.5" />
                Size
              </div>
              <div className="text-sm text-gray-900">{formatFileSize(item.size)}</div>
            </div>
          )}

          {/* Storage used */}
          {type === 'file' && item.size !== undefined && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase">Storage used</div>
              <div className="text-sm text-gray-900">{formatFileSize(item.size)}</div>
            </div>
          )}

          {/* Owner */}
          <div className="space-y-1">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Owner
            </div>
            <div className="text-sm text-gray-900">
              {item.owner_name || 'Me'}
              {item.owner_email && (
                <div className="text-xs text-gray-500 mt-0.5">{item.owner_email}</div>
              )}
            </div>
          </div>

          {/* Modified */}
          <div className="space-y-1">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Modified
            </div>
            <div className="text-sm text-gray-900">
              {formatDate(item.updated_at)}
            </div>
          </div>

          {/* Opened (for files) */}
          {type === 'file' && item.last_accessed_at && (
            <div className="space-y-1">
              <div className="flex items-center text-xs font-semibold text-gray-500 uppercase">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Opened
              </div>
              <div className="text-sm text-gray-900">
                {formatDate(item.last_accessed_at)}
              </div>
            </div>
          )}

          {/* Created */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">Created</div>
            <div className="text-sm text-gray-900">
              {formatDate(item.created_at)}
            </div>
          </div>

          {/* Starred */}
          {item.is_starred && (
            <div className="space-y-1">
              <div className="flex items-center text-xs font-semibold text-gray-500 uppercase">
                <Star className="w-3.5 h-3.5 mr-1.5 fill-yellow-400 text-yellow-400" />
                Starred
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">Location</div>
            <div className="text-sm text-gray-900">
              {item.parent_folder_id ? 'In folder' : 'My Drive'}
            </div>
          </div>

          {/* Description (if available) */}
          {item.description && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase">Description</div>
              <div className="text-sm text-gray-900">{item.description}</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Activity link */}
      <div className="border-t border-gray-200 p-4">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View activity
        </button>
      </div>
    </div>
  );
};

export default DetailsPanel;
