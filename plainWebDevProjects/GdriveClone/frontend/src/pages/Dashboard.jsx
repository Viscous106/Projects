import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { filesAPI, foldersAPI } from '../services/api';
import { useDropzone } from 'react-dropzone';
import {
  Search, Grid3x3, List, Settings, HelpCircle, Menu, Home,
  Clock, Star, Trash2, Upload, FolderPlus, ChevronDown, ChevronRight,
  Download, StarOff, X, FileText, File, Folder, MoreVertical, Share2, SlidersHorizontal, Eye, Info, HardDrive,
  Monitor, Users, AlertCircle, Cloud
} from 'lucide-react';
import ShareDialog from '../components/ShareDialog';
import AdvancedSearch from '../components/AdvancedSearch';
import FileViewer from '../components/FileViewer';
import DriveContextMenu from '../components/DriveContextMenu';
import AnimatedStar from '../components/AnimatedStar';
import ActivityPanel from '../components/ActivityPanel';
import ActivityWidget from '../components/ActivityWidget';
import VersionHistoryModal from '../components/VersionHistoryModal';
import DetailsPanel from '../components/DetailsPanel';
import StorageAnalytics from '../components/StorageAnalytics';
import { useSpring, animated } from 'react-spring';
import './Dashboard.css';

const Dashboard = ({ view = 'my-drive' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [shareDialog, setShareDialog] = useState({ show: false, item: null, type: null });
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'My Drive' }]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState({ files: [], folders: [] });
  const [viewingFile, setViewingFile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [versionHistoryFile, setVersionHistoryFile] = useState(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [showStorageAnalytics, setShowStorageAnalytics] = useState(false);
  const fileInputRef = useRef(null);

  const currentView = view;

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      switch (currentView) {
        case 'home':
          // Home view - show suggested files and folders
          try {
            const homeFiles = await filesAPI.getRecentFiles();
            const homeFolders = await foldersAPI.getFolders(null);
            setFiles(homeFiles?.slice(0, 10) || []);
            setFolders(homeFolders?.slice(0, 5) || []);
          } catch (err) {
            console.error('Error loading home data:', err);
            // Also try loading all files/folders as fallback
            const allFiles = await filesAPI.getFiles(null);
            const allFolders = await foldersAPI.getFolders(null);
            setFiles(allFiles?.slice(0, 10) || []);
            setFolders(allFolders?.slice(0, 5) || []);
          }
          break;
        case 'recent':
          data = await filesAPI.getRecentFiles();
          setFiles(data || []);
          setFolders([]);
          break;
        case 'starred':
          const starredFiles = await filesAPI.getStarredFiles();
          const starredFolders = await foldersAPI.getStarredFolders();
          setFiles(starredFiles || []);
          setFolders(starredFolders || []);
          break;
        case 'shared-with-me':
          // TODO: Get shared files
          setFiles([]);
          setFolders([]);
          break;
        case 'spam':
          // TODO: Get spam files
          setFiles([]);
          setFolders([]);
          break;
        case 'trash':
          const trashedFiles = await filesAPI.getTrashedFiles();
          const trashedFolders = await foldersAPI.getTrashedFolders();
          setFiles(trashedFiles || []);
          setFolders(trashedFolders || []);
          break;
        case 'my-drive':
          const filesData = await filesAPI.getFiles(currentFolder);
          const foldersData = await foldersAPI.getFolders(currentFolder);
          setFiles(filesData || []);
          setFolders(foldersData || []);
          break;
        default:
          const allFilesData = await filesAPI.getFiles(currentFolder);
          const allFoldersData = await foldersAPI.getFolders(currentFolder);
          setFiles(allFilesData || []);
          setFolders(allFoldersData || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [currentView, currentFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Reset folder navigation and reload when view changes
  useEffect(() => {
    if (currentView !== 'my-drive') {
      setCurrentFolder(null);
      setFolderPath([{ id: null, name: 'My Drive' }]);
    }
    loadFiles();
  }, [currentView]);

  // Use search results when in search mode, otherwise use regular files/folders
  const displayFiles = searchMode ? searchResults.files : files;
  const displayFolders = searchMode ? searchResults.folders : folders;

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadComplete(false);
    try {
      for (const file of acceptedFiles) {
        await filesAPI.uploadFile(file, currentFolder);
      }
      await loadFiles();
      setUploadComplete(true);
      // Keep upload message visible for 3 seconds after completion
      setTimeout(() => {
        setUploading(false);
        setUploadComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
      setUploading(false);
      setUploadComplete(false);
    }
  }, [loadFiles, currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      const results = await filesAPI.searchFiles(filters);
      setSearchResults(results);
      setSearchMode(true);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      await handleSearch({ query: searchQuery, status: 'active' });
    }
  };

  const clearSearch = () => {
    setSearchMode(false);
    setSearchQuery('');
    setSearchResults({ files: [], folders: [] });
  };

  const handleDownload = async (file) => {
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

  const handleDelete = async (fileId) => {
    if (window.confirm('Move to trash?')) {
      try {
        await filesAPI.deleteFile(fileId);
        await loadFiles();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file');
      }
    }
  };

  const handleRestore = async (fileId) => {
    try {
      await filesAPI.restoreFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore file');
    }
  };

  const handleToggleStar = async (fileId) => {
    try {
      await filesAPI.toggleStar(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Star error:', error);
    }
  };

  const handleToggleStarFolder = async (folderId) => {
    try {
      await foldersAPI.toggleStarFolder(folderId);
      await loadFiles();
    } catch (error) {
      console.error('Folder star error:', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Move folder to trash?')) {
      try {
        await foldersAPI.deleteFolder(folderId);
        await loadFiles();
      } catch (error) {
        console.error('Delete folder error:', error);
        alert('Failed to delete folder');
      }
    }
  };

  const handleRestoreFolder = async (folderId) => {
    try {
      await foldersAPI.restoreFolder(folderId);
      await loadFiles();
    } catch (error) {
      console.error('Restore folder error:', error);
      alert('Failed to restore folder');
    }
  };

  const handlePermanentDeleteFile = async (fileId) => {
    if (window.confirm('Permanently delete this file? This action cannot be undone.')) {
      try {
        await filesAPI.permanentDeleteFile(fileId);
        await loadFiles();
      } catch (error) {
        console.error('Permanent delete error:', error);
        alert('Failed to permanently delete file');
      }
    }
  };

  const handlePermanentDeleteFolder = async (folderId) => {
    if (window.confirm('Permanently delete this folder? This action cannot be undone.')) {
      try {
        await foldersAPI.permanentDeleteFolder(folderId);
        await loadFiles();
      } catch (error) {
        console.error('Permanent delete folder error:', error);
        alert('Failed to permanently delete folder');
      }
    }
  };

  // File viewer handlers
  const handleFileClick = (file) => {
    setViewingFile(file);
  };

  const handleFileChange = (newFile) => {
    setViewingFile(newFile);
  };

  const handleCloseViewer = () => {
    setViewingFile(null);
  };

  // Context menu handlers
  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file: type === 'file' ? item : null,
      folder: type === 'folder' ? item : null
    });
  };

  const handleCreateFolder = async () => {
    const name = prompt('Folder name:');
    if (name) {
      try {
        await foldersAPI.createFolder(name, currentFolder);
        await loadFiles();
      } catch (error) {
        console.error('Create folder error:', error);
        alert('Failed to create folder');
      }
    }
  };

  const handleShare = (item, type) => {
    setShareDialog({ show: true, item, type });
  };

  const closeShareDialog = () => {
    setShareDialog({ show: false, item: null, type: null });
  };

  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadComplete(false);
    try {
      for (const file of files) {
        await filesAPI.uploadFile(file, currentFolder);
      }
      await loadFiles();
      setUploadComplete(true);
      // Keep upload message visible for 3 seconds after completion
      setTimeout(() => {
        setUploading(false);
        setUploadComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
      setUploading(false);
      setUploadComplete(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    setShowCreateMenu(false);
    fileInputRef.current?.click();
  };

  // Folder navigation handlers
  const handleFolderClick = async (folder) => {
    // Allow navigation in My Drive view
    if (currentView === 'my-drive') {
      setCurrentFolder(folder.id);
      setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    }
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolder(newPath[newPath.length - 1].id);
  };

  // Drag and drop handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, itemType: type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterFolder = (e, folder) => {
    e.preventDefault();
    setDragOverFolder(folder.id);
  };

  const handleDragLeaveFolder = (e) => {
    e.preventDefault();
    setDragOverFolder(null);
  };

  const handleDropOnFolder = async (e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!draggedItem) return;

    try {
      if (draggedItem.itemType === 'file') {
        await filesAPI.moveFile(draggedItem.id, targetFolder.id);
      } else if (draggedItem.itemType === 'folder') {
        // Can't drop folder into itself
        if (draggedItem.id === targetFolder.id) {
          alert('Cannot move folder into itself');
          return;
        }
        await foldersAPI.moveFolder(draggedItem.id, targetFolder.id);
      }
      await loadFiles();
    } catch (error) {
      console.error('Move error:', error);
      alert('Failed to move item');
    } finally {
      setDraggedItem(null);
    }
  };

  const handleDropOnBackground = async (e) => {
    e.preventDefault();

    if (!draggedItem || currentView !== 'my-drive') return;

    try {
      if (draggedItem.itemType === 'file') {
        await filesAPI.moveFile(draggedItem.id, currentFolder);
      } else if (draggedItem.itemType === 'folder') {
        await foldersAPI.moveFolder(draggedItem.id, currentFolder);
      }
      await loadFiles();
    } catch (error) {
      console.error('Move error:', error);
      alert('Failed to move item');
    } finally {
      setDraggedItem(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileIcon = (fileName, isFolder) => {
    if (isFolder) return <Folder size={20} className="file-icon folder-icon" />;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
      return <File size={20} className="file-icon image-icon" />;
    }
    // PDFs
    if (ext === 'pdf') {
      return <FileText size={20} className="file-icon pdf-icon" />;
    }
    // Documents
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      return <FileText size={20} className="file-icon doc-icon" />;
    }
    // Spreadsheets
    if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
      return <FileText size={20} className="file-icon sheet-icon" />;
    }
    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(ext)) {
      return <FileText size={20} className="file-icon slides-icon" />;
    }
    return <File size={20} className="file-icon" />;
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'home': return 'Welcome to Drive';
      case 'recent': return 'Recent';
      case 'starred': return 'Starred';
      case 'shared-with-me': return 'Shared with me';
      case 'spam': return 'Spam';
      case 'trash': return 'Trash';
      default: return currentFolder ? folderPath[folderPath.length - 1]?.name || 'Folder' : 'My Drive';
    }
  };

  // Group files by time periods for Recent view
  const groupFilesByTime = (files) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const groups = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      earlier: []
    };

    files.forEach(file => {
      const fileDate = new Date(file.last_accessed_at || file.updated_at);
      if (fileDate >= today) {
        groups.today.push(file);
      } else if (fileDate >= yesterday) {
        groups.yesterday.push(file);
      } else if (fileDate >= last7Days) {
        groups.previous7Days.push(file);
      } else if (fileDate >= last30Days) {
        groups.previous30Days.push(file);
      } else {
        groups.earlier.push(file);
      }
    });

    return groups;
  };

  return (
    <div className="dashboard" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Hidden file input for button upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <header className="drive-header">
        <div className="header-left">
          <button className="icon-btn menu-btn">
            <Menu size={20} />
          </button>
          <div className="logo-section">
            <svg className="drive-logo" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path fill="#0066da" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"/>
              <path fill="#00ac47" d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"/>
              <path fill="#ea4335" d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"/>
              <path fill="#00832d" d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"/>
              <path fill="#2684fc" d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"/>
              <path fill="#ffba00" d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"/>
            </svg>
            <span className="drive-title">Drive</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleQuickSearch}
            />
            <button
              className="icon-btn advanced-search-btn"
              onClick={() => setShowAdvancedSearch(true)}
              title="Advanced search"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="header-right">
          <button
            className={`icon-btn ${detailsPanelOpen ? 'text-blue-600' : ''}`}
            onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
            title="Details"
          >
            <Info size={20} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setActivityPanelOpen(true)}
            title="Activity"
          >
            <Clock size={20} />
          </button>
          <button className="icon-btn" title="Help">
            <HelpCircle size={20} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setShowStorageAnalytics(true)}
            title="Storage"
          >
            <HardDrive size={20} />
          </button>
          <button className="icon-btn" title="Settings">
            <Settings size={20} />
          </button>
          <div className="user-menu">
            <button
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user?.email || 'Profile'}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="user-menu-divider"></div>
                <button className="menu-item" onClick={() => navigate('/settings')}>
                  <Settings size={16} />
                  Settings
                </button>
                <button className="menu-item" onClick={handleLogout}>
                  <Upload size={16} style={{ transform: 'rotate(180deg)' }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-actions">
            <div className="new-button-wrapper">
              <button 
                className="new-button"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
              >
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <path fill="#34A853" d="M16 16v14h4V20z"/>
                  <path fill="#4285F4" d="M30 16H20l-4 4h14z"/>
                  <path fill="#FBBC04" d="M6 16v4h10l4-4z"/>
                  <path fill="#EA4335" d="M20 16V6h-4v14z"/>
                  <path fill="none" d="M0 0h36v36H0z"/>
                </svg>
                <span>New</span>
              </button>
              {showCreateMenu && (
                <div className="create-menu">
                  <button onClick={handleCreateFolder}>
                    <FolderPlus size={20} />
                    New folder
                  </button>
                  <hr />
                  <button onClick={handleUploadClick}>
                    <Upload size={20} />
                    File upload
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => {
                setCurrentFolder(null);
                setFolderPath([{ id: null, name: 'My Drive' }]);
                navigate('/home');
              }}
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            
            {/* My Drive */}
            <button
              className={`nav-item ${currentView === 'my-drive' ? 'active' : ''}`}
              onClick={() => {
                setCurrentFolder(null);
                setFolderPath([{ id: null, name: 'My Drive' }]);
                navigate('/');
              }}
            >
              <Folder size={20} />
              <span>My Drive</span>
            </button>

            <button 
              className={`nav-item ${currentView === 'shared-with-me' ? 'active' : ''}`}
              onClick={() => navigate('/shared-with-me')}
            >
              <Users size={20} />
              <span>Shared with me</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'recent' ? 'active' : ''}`}
              onClick={() => navigate('/recent')}
            >
              <Clock size={20} />
              <span>Recent</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'starred' ? 'active' : ''}`}
              onClick={() => navigate('/starred')}
            >
              <Star size={20} />
              <span>Starred</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'spam' ? 'active' : ''}`}
              onClick={() => navigate('/spam')}
            >
              <AlertCircle size={20} />
              <span>Spam</span>
            </button>
            
            <button 
              className={`nav-item ${currentView === 'trash' ? 'active' : ''}`}
              onClick={() => navigate('/trash')}
            >
              <Trash2 size={20} />
              <span>Trash</span>
            </button>
          </nav>

          {/* Storage section */}
          <div className="sidebar-storage">
            <div className="storage-label">Storage</div>
            <div className="storage-progress">
              <div className="storage-progress-bar">
                <div className="storage-progress-fill" style={{ width: '2.5%' }}></div>
              </div>
              <div className="storage-text">49.71 GB of 2 TB used</div>
            </div>
            <button className="storage-upgrade-btn">Get more storage</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content" onDrop={handleDropOnBackground} onDragOver={handleDragOver}>
          <div className="content-header">
            <h2>{getViewTitle()}</h2>
            <div className="view-controls">
              <button
                className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
              </button>
              <button
                className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 size={20} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {searchMode ? (
            <div className="breadcrumb-nav" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: '#202124' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={18} />
                <span style={{ fontWeight: '500' }}>
                  Search results ({searchResults.files.length + searchResults.folders.length} items)
                </span>
              </div>
              <button
                onClick={clearSearch}
                style={{
                  background: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Clear search
              </button>
            </div>
          ) : currentView === 'my-drive' && folderPath.length > 0 && (
            <div className="breadcrumb-nav" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#5f6368' }}>
              {folderPath.map((folder, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: index === folderPath.length - 1 ? '#202124' : '#5f6368',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: index === folderPath.length - 1 ? '500' : '400',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    {folder.name}
                  </button>
                  {index < folderPath.length - 1 && (
                    <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {isDragActive && (
            <div className="drop-overlay">
              <div className="drop-message">
                <Upload size={48} />
                <p>Drop files to upload</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              {uploadComplete ? '✅ Upload complete!' : `Uploading files to ${currentFolder ? folderPath[folderPath.length - 1]?.name || 'folder' : 'My Drive'}...`}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {/* Home View - Special Layout */}
              {currentView === 'home' ? (
                <div className="home-view">
                  <div className="home-sections">
                      {/* Suggested Folders */}
                      <div className="home-section">
                        <div className="home-section-header">
                          <h3>Suggested folders</h3>
                          <ChevronDown size={20} />
                        </div>
                        {displayFolders.length > 0 ? (
                          <div className="home-items-grid">
                            {displayFolders.slice(0, 3).map((folder) => (
                              <div
                                key={folder.id}
                                className="home-item"
                                onClick={() => handleFolderClick(folder)}
                              >
                                <Folder size={24} className="home-item-icon" />
                                <div className="home-item-info">
                                  <div className="home-item-name">{folder.name}</div>
                                  <div className="home-item-meta">In My Drive</div>
                                </div>
                                <MoreVertical size={16} className="home-item-menu" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="home-empty">No folders available</div>
                        )}
                      </div>

                      {/* Suggested Files */}
                      <div className="home-section">
                        <div className="home-section-header">
                          <h3>Suggested files</h3>
                          <div className="home-view-toggle">
                            <List size={16} />
                            <Grid3x3 size={16} />
                          </div>
                        </div>
                        {displayFiles.length > 0 ? (
                          <div className="home-files-list">
                            {displayFiles.map((file) => (
                              <div
                                key={file.id}
                                className="home-file-item"
                                onClick={() => handleFileClick(file)}
                              >
                                {getFileIcon(file.name, true)}
                                <div className="home-file-info">
                                  <div className="home-file-name">{file.name}</div>
                                  <div className="home-file-details">
                                    {file.last_accessed_at ? `You opened • ${formatDate(file.last_accessed_at)}` : `Modified • ${formatDate(file.updated_at)}`}
                                  </div>
                                </div>
                                <MoreVertical size={16} className="home-file-menu" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="home-empty">No files available. Upload some files to get started!</div>
                        )}
                      </div>
                    </div>
                </div>
              ) : viewMode === 'list' ? (
                <div className="file-list">
                  {/* Table Header */}
                  {(displayFiles.length > 0 || displayFolders.length > 0) && currentView !== 'recent' && (
                    <div className="file-list-header">
                      <div className="header-name">Name</div>
                      <div className="header-owner">Owner</div>
                      <div className="header-modified">Last modified</div>
                      <div className="header-size">File size</div>
                      <div className="header-actions"></div>
                    </div>
                  )}

                  {/* Special rendering for Recent view with time-based grouping */}
                  {currentView === 'recent' && displayFiles.length > 0 && (() => {
                    const grouped = groupFilesByTime(displayFiles);
                    return (
                      <>
                        {grouped.today.length > 0 && (
                          <div className="file-section">
                            <div className="section-header">Today</div>
                            {grouped.today.map((file) => (
                              <div
                                key={file.id}
                                className="file-item"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="file-info">
                                  {getFileIcon(file.name, false)}
                                  <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-owner">me</div>
                                <div className="file-modified">{formatDate(file.last_accessed_at || file.updated_at)}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                                <div className="file-actions">
                                  <AnimatedStar
                                    isStarred={file.starred}
                                    size={16}
                                    onClick={(e) => handleToggleStar(file.id)}
                                  />
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }} title="Share">
                                    <Share2 size={16} />
                                  </button>
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }} title="Download">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {grouped.yesterday.length > 0 && (
                          <div className="file-section">
                            <div className="section-header">Yesterday</div>
                            {grouped.yesterday.map((file) => (
                              <div
                                key={file.id}
                                className="file-item"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="file-info">
                                  {getFileIcon(file.name, false)}
                                  <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-owner">me</div>
                                <div className="file-modified">{formatDate(file.last_accessed_at || file.updated_at)}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                                <div className="file-actions">
                                  <AnimatedStar
                                    isStarred={file.starred}
                                    size={16}
                                    onClick={(e) => handleToggleStar(file.id)}
                                  />
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }} title="Share">
                                    <Share2 size={16} />
                                  </button>
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }} title="Download">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {grouped.previous7Days.length > 0 && (
                          <div className="file-section">
                            <div className="section-header">Previous 7 days</div>
                            {grouped.previous7Days.map((file) => (
                              <div
                                key={file.id}
                                className="file-item"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="file-info">
                                  {getFileIcon(file.name, false)}
                                  <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-owner">me</div>
                                <div className="file-modified">{formatDate(file.last_accessed_at || file.updated_at)}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                                <div className="file-actions">
                                  <AnimatedStar
                                    isStarred={file.starred}
                                    size={16}
                                    onClick={(e) => handleToggleStar(file.id)}
                                  />
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }} title="Share">
                                    <Share2 size={16} />
                                  </button>
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }} title="Download">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {grouped.previous30Days.length > 0 && (
                          <div className="file-section">
                            <div className="section-header">Previous 30 days</div>
                            {grouped.previous30Days.map((file) => (
                              <div
                                key={file.id}
                                className="file-item"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="file-info">
                                  {getFileIcon(file.name, false)}
                                  <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-owner">me</div>
                                <div className="file-modified">{formatDate(file.last_accessed_at || file.updated_at)}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                                <div className="file-actions">
                                  <AnimatedStar
                                    isStarred={file.starred}
                                    size={16}
                                    onClick={(e) => handleToggleStar(file.id)}
                                  />
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }} title="Share">
                                    <Share2 size={16} />
                                  </button>
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }} title="Download">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {grouped.earlier.length > 0 && (
                          <div className="file-section">
                            <div className="section-header">Earlier</div>
                            {grouped.earlier.map((file) => (
                              <div
                                key={file.id}
                                className="file-item"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="file-info">
                                  {getFileIcon(file.name, false)}
                                  <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-owner">me</div>
                                <div className="file-modified">{formatDate(file.last_accessed_at || file.updated_at)}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                                <div className="file-actions">
                                  <AnimatedStar
                                    isStarred={file.starred}
                                    size={16}
                                    onClick={(e) => handleToggleStar(file.id)}
                                  />
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }} title="Share">
                                    <Share2 size={16} />
                                  </button>
                                  <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }} title="Download">
                                    <Download size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Regular rendering for other views - merged files and folders */}
                  {currentView !== 'recent' && (displayFolders.length > 0 || displayFiles.length > 0) && (
                    <div className="file-section">
                      {/* Render folders first */}
                      {displayFolders.map((folder) => (
                        <div
                          key={folder.id}
                          className="file-item"
                          draggable
                          onDragStart={(e) => handleDragStart(e, folder, 'folder')}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnterFolder(e, folder)}
                          onDragLeave={handleDragLeaveFolder}
                          onDrop={(e) => handleDropOnFolder(e, folder)}
                          onClick={() => handleFolderClick(folder)}
                          onDoubleClick={() => handleFolderClick(folder)}
                          onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: dragOverFolder === folder.id ? '#e8f0fe' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div className="file-info">
                            {getFileIcon(folder.name, true)}
                            <span className="file-name">{folder.name}</span>
                          </div>
                          <div className="file-owner">me</div>
                          <div className="file-modified">{formatDate(folder.created_at)}</div>
                          <div className="file-size">-</div>
                          <div className="file-actions" onClick={(e) => e.stopPropagation()}>
                            {currentView === 'trash' ? (
                              <>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); handleRestoreFolder(folder.id); }}
                                  title="Restore"
                                >
                                  <Upload size={16} />
                                </button>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); handlePermanentDeleteFolder(folder.id); }}
                                  title="Delete forever"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                  <AnimatedStar
                                    isStarred={folder.is_starred}
                                    size={16}
                                    onClick={(e) => handleToggleStarFolder(folder.id)}
                                  />
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(folder, 'folder'); }}
                                  title="Share"
                                >
                                  <Share2 size={16} />
                                </button>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteFolder(folder.id); }}
                                  title="Move to trash"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Then render files */}
                      {displayFiles.map((file) => (
                        <div
                          key={file.id}
                          className="file-item"
                          draggable
                          onDragStart={(e) => handleDragStart(e, file, 'file')}
                          onClick={() => handleFileClick(file)}
                          onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="file-info">
                            {getFileIcon(file.name, false)}
                            <span className="file-name">{file.name}</span>
                          </div>
                          <div className="file-owner">me</div>
                          <div className="file-modified">{formatDate(file.updated_at)}</div>
                          <div className="file-size">{formatFileSize(file.size)}</div>
                          <div className="file-actions">
                            <button
                              className="icon-btn-small"
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleStar(file.id); }}
                              title={file.starred ? "Remove star" : "Add star"}
                            >
                              {file.starred ? <Star size={16} fill="#fbbc04" color="#fbbc04" /> : <StarOff size={16} />}
                            </button>
                            {currentView === 'trash' ? (
                              <>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRestore(file.id); }}
                                  title="Restore"
                                >
                                  <Upload size={16} />
                                </button>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handlePermanentDeleteFile(file.id); }}
                                  title="Delete forever"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(file, 'file'); }}
                                  title="Share"
                                >
                                  <Share2 size={16} />
                                </button>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDownload(file); }}
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                                <button
                                  className="icon-btn-small"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(file.id); }}
                                  title="Move to trash"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {displayFiles.length === 0 && displayFolders.length === 0 && (
                    <div className="empty-state">
                      {searchMode && (
                        <>
                          <p>No results found</p>
                          <p className="empty-subtitle">Try adjusting your search filters</p>
                        </>
                      )}
                      {!searchMode && currentView === 'recent' && (
                        <>
                          <p>No recent files</p>
                          <p className="empty-subtitle">Files you open will appear here</p>
                        </>
                      )}
                      {!searchMode && currentView === 'starred' && (
                        <>
                          <p>No starred files</p>
                          <p className="empty-subtitle">Star files to easily find them later</p>
                        </>
                      )}
                      {!searchMode && currentView === 'trash' && (
                        <>
                          <p>Trash is empty</p>
                          <p className="empty-subtitle">Items in trash will be deleted forever after 30 days</p>
                        </>
                      )}
                      {!searchMode && currentView === 'my-drive' && (
                        <>
                          <p>No files yet</p>
                          <p className="empty-subtitle">Drop files here or use the New button to upload</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="file-grid">
                  {displayFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="grid-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, folder, 'folder')}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnterFolder(e, folder)}
                      onDragLeave={handleDragLeaveFolder}
                      onDrop={(e) => handleDropOnFolder(e, folder)}
                      onClick={() => handleFolderClick(folder)}
                      onDoubleClick={() => handleFolderClick(folder)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: dragOverFolder === folder.id ? '#e8f0fe' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div className="grid-item-preview folder-preview">
                        <Folder size={32} />
                      </div>
                      <div className="grid-item-info">
                        <span className="grid-item-name">{folder.name}</span>
                      </div>
                    </div>
                  ))}
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="grid-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, file, 'file')}
                    >
                      <div className="grid-item-preview">
                        {getFileIcon(file.name, false)}
                      </div>
                      <div className="grid-item-info">
                        <span className="grid-item-name">{file.name}</span>
                      </div>
                    </div>
                  ))}
                  {displayFiles.length === 0 && displayFolders.length === 0 && (
                    <div className="empty-state">
                      {searchMode && (
                        <>
                          <p>No results found</p>
                          <p className="empty-subtitle">Try adjusting your search filters</p>
                        </>
                      )}
                      {!searchMode && currentView === 'recent' && (
                        <>
                          <p>No recent files</p>
                          <p className="empty-subtitle">Files you open will appear here</p>
                        </>
                      )}
                      {!searchMode && currentView === 'starred' && (
                        <>
                          <p>No starred files</p>
                          <p className="empty-subtitle">Star files to easily find them later</p>
                        </>
                      )}
                      {!searchMode && currentView === 'trash' && (
                        <>
                          <p>Trash is empty</p>
                          <p className="empty-subtitle">Items in trash will be deleted forever after 30 days</p>
                        </>
                      )}
                      {!searchMode && currentView === 'my-drive' && (
                        <>
                          <p>No files yet</p>
                          <p className="empty-subtitle">Drop files here or use the New button to upload</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Share Dialog */}
      {shareDialog.show && (
        <ShareDialog
          item={shareDialog.item}
          itemType={shareDialog.type}
          onClose={closeShareDialog}
        />
      )}

      {/* Advanced Search */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleSearch}
        folders={folders}
      />

      {/* File Viewer */}
      {viewingFile && (
        <FileViewer
          file={viewingFile}
          files={displayFiles}
          onClose={handleCloseViewer}
          onFileChange={handleFileChange}
          onShare={(file) => openShareDialog(file, 'file')}
          onStar={async (file) => {
            await handleToggleStar(file.id);
            setViewingFile({ ...file, is_starred: !file.is_starred });
          }}
          onDelete={async (file) => {
            await handleDelete(file.id);
            handleCloseViewer();
          }}
          currentUser={user}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <DriveContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          folder={contextMenu.folder}
          onClose={() => setContextMenu(null)}
          onOpen={(item) => {
            if (contextMenu.file) {
              handleFileClick(item);
            } else if (contextMenu.folder) {
              handleFolderClick(item);
            }
          }}
          onDownload={handleDownload}
          onShare={(item, type) => openShareDialog(item, type)}
          onStar={(id) => {
            if (contextMenu.file) {
              handleToggleStar(id);
            } else if (contextMenu.folder) {
              handleToggleStarFolder(id);
            }
          }}
          onDelete={(id) => {
            if (contextMenu.file) {
              handleDelete(id);
            } else if (contextMenu.folder) {
              handleDeleteFolder(id);
            }
          }}
          onMove={(id) => {
            // TODO: Implement move functionality
            console.log('Move item:', id);
          }}
          onRename={(item) => {
            // TODO: Implement rename functionality
            console.log('Rename item:', item);
          }}
          onDetails={(item, type) => {
            setSelectedItemForDetails(item);
            setSelectedItemType(type);
            setDetailsPanelOpen(true);
          }}
        />
      )}

      {/* Activity Panel */}
      <ActivityPanel
        isOpen={activityPanelOpen}
        onClose={() => setActivityPanelOpen(false)}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={!!versionHistoryFile}
        onClose={() => setVersionHistoryFile(null)}
        file={versionHistoryFile}
      />

      {/* Details Panel */}
      <DetailsPanel
        item={selectedItemForDetails}
        type={selectedItemType}
        isOpen={detailsPanelOpen}
        onClose={() => {
          setDetailsPanelOpen(false);
          setSelectedItemForDetails(null);
          setSelectedItemType(null);
        }}
      />

      {/* Storage Analytics */}
      {showStorageAnalytics && (
        <StorageAnalytics onClose={() => setShowStorageAnalytics(false)} />
      )}
    </div>
  );
};

export default Dashboard;
