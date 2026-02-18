import { useState, useEffect } from 'react';
import {
  X, Download, Share2, MoreVertical, ChevronLeft, ChevronRight,
  Star, StarOff, Trash2, Info, ExternalLink, ZoomIn, ZoomOut,
  RotateCw, Maximize2, Printer, MessageSquare
} from 'lucide-react';
import { useSpring, animated } from 'react-spring';
import { filesAPI } from '../services/api';
import CommentsPanel from './CommentsPanel';
import './FileViewer.css';

const FileViewer = ({ file, files = [], onClose, onFileChange, onShare, onStar, onDelete, currentUser }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const currentIndex = files.findIndex(f => f.id === file.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  useEffect(() => {
    loadFile();
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file.id]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await filesAPI.downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await filesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && onFileChange) {
      onFileChange(files[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onFileChange) {
      onFileChange(files[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const getFileType = () => {
    const mimeType = file.mime_type || '';
    const fileName = file.name?.toLowerCase() || '';
    
    // Images
    if (mimeType.startsWith('image/')) return 'image';
    
    // Videos
    if (mimeType.startsWith('video/')) return 'video';
    
    // Audio
    if (mimeType.startsWith('audio/')) return 'audio';
    
    // PDF
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf';
    
    // Text files
    if (mimeType.includes('text/') || 
        fileName.endsWith('.txt') || 
        fileName.endsWith('.md') || 
        fileName.endsWith('.csv') ||
        fileName.endsWith('.json') ||
        fileName.endsWith('.xml') ||
        fileName.endsWith('.html') ||
        fileName.endsWith('.css') ||
        fileName.endsWith('.js') ||
        fileName.endsWith('.ts') ||
        fileName.endsWith('.jsx') ||
        fileName.endsWith('.tsx') ||
        fileName.endsWith('.yaml') ||
        fileName.endsWith('.yml')) return 'text';
    
    // Office Documents (try to preview via iframe/embed if possible)
    if (mimeType.includes('application/vnd.ms-excel') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') ||
        fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return 'office';
    
    if (mimeType.includes('application/vnd.ms-powerpoint') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml') ||
        fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return 'office';
    
    if (mimeType.includes('application/msword') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') ||
        fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'office';
    
    return 'other';
  };

  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="viewer-loading">
          <div className="spinner"></div>
          <p>Loading {file.name}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="viewer-error">
          <p>{error}</p>
          <button onClick={loadFile} className="retry-btn">Retry</button>
        </div>
      );
    }

    const fileType = getFileType();

    switch (fileType) {
      case 'image':
        return (
          <div className="image-viewer">
            <img
              src={fileUrl}
              alt={file.name}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="video-viewer">
            <video controls src={fileUrl} style={{ maxWidth: '100%', maxHeight: '100%' }}>
              Your browser does not support video playback.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="audio-viewer">
            <div className="audio-placeholder">
              <div className="audio-icon">🎵</div>
              <h3>{file.name}</h3>
              <audio controls src={fileUrl} style={{ width: '100%', maxWidth: '400px', marginTop: '20px' }}>
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="pdf-viewer">
            <iframe
              src={fileUrl}
              title={file.name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        );

      case 'text':
        return (
          <div className="text-viewer">
            <iframe
              src={fileUrl}
              title={file.name}
              style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
            />
          </div>
        );

      case 'office':
        return (
          <div className="office-viewer">
            <div className="office-placeholder">
              <div className="office-icon">📄</div>
              <h3>{file.name}</h3>
              <p>Office documents cannot be previewed in the browser</p>
              <p>Please download the file to view it</p>
              <button onClick={handleDownload} className="download-btn-large">
                <Download size={20} />
                Download to view
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="unsupported-viewer">
            <div className="unsupported-content">
              <div className="file-icon-large">📄</div>
              <h3>No preview available</h3>
              <p>{file.name}</p>
              <button onClick={handleDownload} className="download-btn-large">
                <Download size={20} />
                Download to view
              </button>
            </div>
          </div>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const fileType = getFileType();

  // React Spring animation for modal
  const overlayAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 300, friction: 30 }
  });

  const modalAnimation = useSpring({
    opacity: 1,
    transform: 'scale(1)',
    from: { opacity: 0, transform: 'scale(0.95)' },
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.div className="file-viewer-overlay" style={overlayAnimation}>
      {/* Header */}
      <div className="file-viewer-header">
        <div className="header-left">
          <button onClick={onClose} className="viewer-icon-btn" title="Close">
            <X size={24} />
          </button>
          <div className="file-info-header">
            <h2 className="file-name-header">{file.name}</h2>
            <span className="file-owner">Owned by you</span>
          </div>
        </div>

        <div className="header-right">
          {fileType === 'image' && (
            <>
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="viewer-icon-btn"
                title="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="zoom-level">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="viewer-icon-btn"
                title="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="viewer-icon-btn"
                title="Rotate"
              >
                <RotateCw size={20} />
              </button>
            </>
          )}

          <button
            onClick={() => onStar && onStar(file)}
            className="viewer-icon-btn"
            title={file.is_starred ? 'Remove star' : 'Add star'}
          >
            {file.is_starred ? <Star size={20} fill="#fbbc04" color="#fbbc04" /> : <StarOff size={20} />}
          </button>

          <button onClick={handleDownload} className="viewer-icon-btn" title="Download">
            <Download size={20} />
          </button>

          <button onClick={() => onShare && onShare(file)} className="viewer-icon-btn" title="Share">
            <Share2 size={20} />
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`viewer-icon-btn ${showComments ? 'active' : ''}`}
            title="Comments"
          >
            <MessageSquare size={20} />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`viewer-icon-btn ${showInfo ? 'active' : ''}`}
            title="Info"
          >
            <Info size={20} />
          </button>

          <button className="viewer-icon-btn" title="More">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="file-viewer-body">
        {/* Navigation */}
        {files.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className={`nav-btn nav-btn-left ${!hasPrevious ? 'disabled' : ''}`}
              disabled={!hasPrevious}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={handleNext}
              className={`nav-btn nav-btn-right ${!hasNext ? 'disabled' : ''}`}
              disabled={!hasNext}
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* File Content */}
        <animated.div className="file-content" style={modalAnimation}>
          {renderFileContent()}
        </animated.div>

        {/* Comments Panel */}
        {showComments && (
          <div className="comments-panel-container">
            <CommentsPanel fileId={file.id} currentUser={currentUser} />
          </div>
        )}

        {/* Info Panel */}
        {showInfo && (
          <div className="info-panel">
            <div className="info-header">
              <h3>Details</h3>
              <button onClick={() => setShowInfo(false)} className="info-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="info-content">
              <div className="info-section">
                <h4>File information</h4>
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{file.mime_type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{formatFileSize(file.size)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created</span>
                  <span className="info-value">{formatDate(file.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Modified</span>
                  <span className="info-value">{formatDate(file.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default FileViewer;
