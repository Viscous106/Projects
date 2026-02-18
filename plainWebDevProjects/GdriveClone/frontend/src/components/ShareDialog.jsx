import { useState, useEffect, useRef } from 'react';
import {
  X, Link as LinkIcon, Check, Globe, Lock, User, ChevronDown,
  Mail, Settings as SettingsIcon, Copy
} from 'lucide-react';
import { sharingAPI } from '../services/api';
import './ShareDialog.css';

const ShareDialog = ({ item, itemType, onClose }) => {
  const [shareLink, setShareLink] = useState(null);
  const [linkPermission, setLinkPermission] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkAccess, setLinkAccess] = useState('restricted');

  // User sharing
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const searchTimeoutRef = useRef(null);
  const suggestionRef = useRef(null);

  useEffect(() => {
    loadShareLink();
    loadPermissions();
  }, []);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadShareLink = async () => {
    try {
      const links = await sharingAPI.getShareLinks(itemType, item.id);
      if (links && links.length > 0) {
        setShareLink(links[0]);
        setLinkAccess('anyone');
        setLinkPermission(links[0].permission?.permission_role || 'viewer');
      }
    } catch (error) {
      console.error('Failed to load share link:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const perms = await sharingAPI.getItemPermissions(itemType, item.id);
      setPermissions(perms || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const link = await sharingAPI.createShareLink(itemType, item.id, linkPermission);
      setShareLink(link);
      setLinkAccess('anyone');
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLink = async () => {
    if (!shareLink) return;
    if (!confirm('Remove link access?')) return;

    setLoading(true);
    try {
      await sharingAPI.deactivateShareLink(shareLink.id);
      setShareLink(null);
      setLinkAccess('restricted');
    } catch (error) {
      console.error('Failed to remove link:', error);
      alert('Failed to remove link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shared/${shareLink.token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkAccessChange = (access) => {
    if (access === 'restricted' && shareLink) {
      handleRemoveLink();
    } else if (access === 'anyone' && !shareLink) {
      handleCreateLink();
    }
  };

  // User search functionality
  const handleEmailInputChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Search after 300ms delay
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchingUsers(true);
        try {
          const users = await sharingAPI.searchUsers(value);
          setUserSuggestions(users);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to search users:', error);
        } finally {
          setSearchingUsers(false);
        }
      }, 300);
    } else {
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = async (user) => {
    setEmailInput('');
    setShowSuggestions(false);
    setUserSuggestions([]);

    // Check if user already has access
    if (permissions.some(p => p.user_id === user.id)) {
      alert('This user already has access');
      return;
    }

    // Share with user
    try {
      await sharingAPI.shareWithUser(itemType, item.id, user.id, selectedRole);
      await loadPermissions();
    } catch (error) {
      console.error('Failed to share with user:', error);
      alert('Failed to share with user');
    }
  };

  const handleRevokePermission = async (permission) => {
    if (!confirm(`Remove ${permission.email}'s access?`)) return;

    try {
      await sharingAPI.revokePermission(itemType, item.id, permission.user_id);
      await loadPermissions();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      alert('Failed to revoke access');
    }
  };

  const handleChangePermission = async (permission, newRole) => {
    try {
      await sharingAPI.shareWithUser(itemType, item.id, permission.user_id, newRole);
      await loadPermissions();
    } catch (error) {
      console.error('Failed to update permission:', error);
      alert('Failed to update permission');
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      viewer: 'Viewer',
      commenter: 'Commenter',
      editor: 'Editor',
      owner: 'Owner'
    };
    return labels[role] || role;
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      viewer: 'Can view',
      commenter: 'Can comment',
      editor: 'Can edit',
      owner: 'Owner'
    };
    return descriptions[role] || '';
  };

  return (
    <div className="share-dialog-overlay" onClick={onClose}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="share-dialog-header">
          <h2>Share "{item.name}"</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="share-dialog-body">
          {/* Add people section */}
          <div className="add-people-section">
            <div className="add-people-input-wrapper" ref={suggestionRef}>
              <div className="add-people-input">
                <Mail size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="Add people or groups"
                  value={emailInput}
                  onChange={handleEmailInputChange}
                  onFocus={() => emailInput.length >= 2 && setShowSuggestions(true)}
                />
                <select
                  className="role-selector"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              {/* User suggestions dropdown */}
              {showSuggestions && (
                <div className="user-suggestions">
                  {searchingUsers ? (
                    <div className="suggestion-loading">Searching...</div>
                  ) : userSuggestions.length > 0 ? (
                    userSuggestions.map((user) => (
                      <div
                        key={user.id}
                        className="user-suggestion-item"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="user-avatar-small">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="user-suggestion-info">
                          <div className="user-suggestion-name">{user.name}</div>
                          <div className="user-suggestion-email">{user.email}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* People with access */}
          <div className="people-with-access">
            <div className="section-title">People with access</div>

            {/* Owner */}
            <div className="person-item">
              <div className="person-avatar">
                {item.owner_name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="person-info">
                <div className="person-name">{item.owner_name || 'Me'} (you)</div>
                <div className="person-email">Owner</div>
              </div>
              <div className="person-role">
                Owner
              </div>
            </div>

            {/* Shared users */}
            {permissions.map((permission) => (
              <div key={permission.id} className="person-item">
                <div className="person-avatar">
                  {permission.user_name?.[0]?.toUpperCase() || permission.email?.[0]?.toUpperCase()}
                </div>
                <div className="person-info">
                  <div className="person-name">{permission.user_name}</div>
                  <div className="person-email">{permission.email}</div>
                </div>
                <div className="person-role-selector">
                  <select
                    value={permission.role}
                    onChange={(e) => handleChangePermission(permission, e.target.value)}
                    className="role-dropdown"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    className="remove-access-btn"
                    onClick={() => handleRevokePermission(permission)}
                    title="Remove access"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* General Access Section */}
          <div className="general-access-section">
            <div className="section-title">General access</div>

            <div className="access-option">
              <div className="access-icon">
                {linkAccess === 'restricted' ? <Lock size={20} /> : <Globe size={20} />}
              </div>
              <div className="access-info">
                <select
                  className="access-select"
                  value={linkAccess}
                  onChange={(e) => handleLinkAccessChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="restricted">Restricted</option>
                  <option value="anyone">Anyone with the link</option>
                </select>
                <div className="access-description">
                  {linkAccess === 'restricted'
                    ? 'Only people with access can open with the link'
                    : 'Anyone on the internet with the link can view'}
                </div>
              </div>
              {linkAccess === 'anyone' && shareLink && (
                <select
                  className="permission-select"
                  value={linkPermission}
                  onChange={(e) => setLinkPermission(e.target.value)}
                  disabled={loading}
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
              )}
            </div>
          </div>

          {/* Copy Link Section */}
          {shareLink && linkAccess === 'anyone' && (
            <div className="link-section">
              <button
                className="copy-link-btn-primary"
                onClick={handleCopyLink}
              >
                <LinkIcon size={16} />
                {copied ? 'Link copied!' : 'Copy link'}
              </button>
            </div>
          )}
        </div>

        <div className="share-dialog-footer">
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
