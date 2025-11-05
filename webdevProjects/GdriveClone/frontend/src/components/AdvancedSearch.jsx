import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, FileType, User, Folder, Star } from 'lucide-react';
import './AdvancedSearch.css';

const AdvancedSearch = ({ isOpen, onClose, onSearch, folders }) => {
  const [filters, setFilters] = useState({
    query: '',
    fileType: '',
    owner: 'anyone',
    folderId: '',
    dateModifiedType: '',
    dateModifiedStart: '',
    dateModifiedEnd: '',
    isStarred: '',
    status: 'active'
  });

  const fileTypes = [
    { value: '', label: 'Any type' },
    { value: 'folder', label: 'Folders' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'document', label: 'Documents' },
    { value: 'spreadsheet', label: 'Spreadsheets' },
    { value: 'archive', label: 'Archives' },
    { value: 'other', label: 'Other' }
  ];

  const dateOptions = [
    { value: '', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'thisYear', label: 'This year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: '',
      fileType: '',
      owner: 'anyone',
      folderId: '',
      dateModifiedType: '',
      dateModifiedStart: '',
      dateModifiedEnd: '',
      isStarred: '',
      status: 'active'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-search-overlay" onClick={onClose}>
      <div className="advanced-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="advanced-search-header">
          <h2>Advanced Search</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="advanced-search-body">
          {/* Search Query */}
          <div className="search-field">
            <label>
              <Search size={16} />
              Has the words
            </label>
            <input
              type="text"
              placeholder="Enter search terms"
              value={filters.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
            />
          </div>

          {/* File Type */}
          <div className="search-field">
            <label>
              <FileType size={16} />
              Type
            </label>
            <select
              value={filters.fileType}
              onChange={(e) => handleInputChange('fileType', e.target.value)}
            >
              {fileTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div className="search-field">
            <label>
              <User size={16} />
              Owner
            </label>
            <select
              value={filters.owner}
              onChange={(e) => handleInputChange('owner', e.target.value)}
            >
              <option value="anyone">Anyone</option>
              <option value="me">Owned by me</option>
              <option value="notme">Not owned by me</option>
            </select>
          </div>

          {/* Location */}
          <div className="search-field">
            <label>
              <Folder size={16} />
              Location
            </label>
            <select
              value={filters.folderId}
              onChange={(e) => handleInputChange('folderId', e.target.value)}
            >
              <option value="">Anywhere</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Modified */}
          <div className="search-field">
            <label>
              <Calendar size={16} />
              Date modified
            </label>
            <select
              value={filters.dateModifiedType}
              onChange={(e) => handleInputChange('dateModifiedType', e.target.value)}
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.dateModifiedType === 'custom' && (
            <div className="search-field date-range">
              <div className="date-input">
                <label>From</label>
                <input
                  type="date"
                  value={filters.dateModifiedStart}
                  onChange={(e) => handleInputChange('dateModifiedStart', e.target.value)}
                />
              </div>
              <div className="date-input">
                <label>To</label>
                <input
                  type="date"
                  value={filters.dateModifiedEnd}
                  onChange={(e) => handleInputChange('dateModifiedEnd', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Starred */}
          <div className="search-field">
            <label>
              <Star size={16} />
              Starred
            </label>
            <select
              value={filters.isStarred}
              onChange={(e) => handleInputChange('isStarred', e.target.value)}
            >
              <option value="">All items</option>
              <option value="true">Starred</option>
              <option value="false">Not starred</option>
            </select>
          </div>

          {/* Status */}
          <div className="search-field">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="trashed">Trashed</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        <div className="advanced-search-footer">
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
