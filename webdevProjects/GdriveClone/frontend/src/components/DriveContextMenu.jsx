import { useEffect, useRef, useState } from 'react';
import {
  Download, Share2, Star, StarOff, Trash2, Edit3, Copy,
  Folder, Info, Link as LinkIcon, Eye, ChevronRight,
  Move, FolderPlus, Users, MoreVertical, Settings
} from 'lucide-react';
import './DriveContextMenu.css';

const DriveContextMenu = ({ x, y, onClose, file, folder, onOpen, onDownload, onShare, onStar, onDelete, onMove, onRename, onDetails }) => {
  const menuRef = useRef(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const submenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  useEffect(() => {
    if (openSubmenu && submenuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const subRect = submenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let submenuX = rect.right + 4;
      if (submenuX + subRect.width > viewportWidth) {
        submenuX = rect.left - subRect.width - 4;
      }

      submenuRef.current.style.left = `${submenuX}px`;
      submenuRef.current.style.top = `${rect.top}px`;
    }
  }, [openSubmenu]);

  const handleItemClick = (action) => {
    if (action) {
      action();
    }
    onClose();
  };

  const submenuTimeoutRef = useRef(null);

  const handleSubmenuEnter = (submenu) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
    setOpenSubmenu(submenu);
  };

  const handleSubmenuLeave = () => {
    // Clear any existing timeout
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    // Delay closing submenu to allow mouse to move to submenu
    submenuTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 300);
  };

  const handleSubmenuMouseEnter = () => {
    // Cancel closing when mouse enters submenu
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
  };

  const handleSubmenuMouseLeave = () => {
    // Close submenu when mouse leaves submenu area
    setOpenSubmenu(null);
  };

  const getMenuItems = () => {
    if (folder) {
      return [
        {
          label: 'Open',
          icon: <Folder size={18} />,
          action: () => onOpen && onOpen(folder)
        },
        { divider: true },
        {
          label: 'Share',
          icon: <Share2 size={18} />,
          hasSubmenu: true,
          submenu: [
            {
              label: 'Share with people',
              icon: <Users size={18} />,
              action: () => onShare && onShare(folder, 'folder')
            },
            {
              label: 'Get link',
              icon: <LinkIcon size={18} />,
              action: () => onShare && onShare(folder, 'folder')
            }
          ]
        },
        {
          label: 'Organize',
          icon: <Move size={18} />,
          hasSubmenu: true,
          submenu: [
            {
              label: 'Move to',
              icon: <FolderPlus size={18} />,
              action: () => onMove && onMove(folder.id)
            },
            {
              label: 'Add shortcut',
              icon: <LinkIcon size={18} />,
              action: () => {}
            }
          ]
        },
        {
          label: 'Folder information',
          icon: <Info size={18} />,
          action: () => onDetails && onDetails(folder, 'folder')
        },
        { divider: true },
        {
          label: folder.is_starred ? 'Remove star' : 'Add star',
          icon: folder.is_starred ? <StarOff size={18} /> : <Star size={18} />,
          action: () => onStar && onStar(folder.id)
        },
        { divider: true },
        {
          label: 'Rename',
          icon: <Edit3 size={18} />,
          action: () => onRename && onRename(folder)
        },
        { divider: true },
        {
          label: 'Move to trash',
          icon: <Trash2 size={18} />,
          action: () => onDelete && onDelete(folder.id)
        }
      ];
    }

    // File menu items
    return [
      {
        label: 'Open',
        icon: <Eye size={18} />,
        hasSubmenu: true,
        submenu: [
          {
            label: 'Open',
            icon: <Eye size={18} />,
            action: () => onOpen && onOpen(file)
          },
          {
            label: 'Google Docs',
            action: () => {}
          },
          {
            label: 'Google Sheets',
            action: () => {}
          },
          {
            label: 'Google Slides',
            action: () => {}
          }
        ]
      },
      { divider: true },
      {
        label: 'Download',
        icon: <Download size={18} />,
        action: () => onDownload && onDownload(file)
      },
      {
        label: 'Share',
        icon: <Share2 size={18} />,
        hasSubmenu: true,
        submenu: [
          {
            label: 'Share with people',
            icon: <Users size={18} />,
            action: () => onShare && onShare(file, 'file')
          },
          {
            label: 'Get link',
            icon: <LinkIcon size={18} />,
            action: () => onShare && onShare(file, 'file')
          }
        ]
      },
      {
        label: 'Organize',
        icon: <Move size={18} />,
        hasSubmenu: true,
        submenu: [
          {
            label: 'Move to',
            icon: <FolderPlus size={18} />,
            action: () => onMove && onMove(file.id)
          },
          {
            label: 'Add shortcut',
            icon: <LinkIcon size={18} />,
            action: () => {}
          },
          {
            label: 'Make a copy',
            icon: <Copy size={18} />,
            action: () => {}
          }
        ]
      },
      {
        label: 'File information',
        icon: <Info size={18} />,
        action: () => onDetails && onDetails(file, 'file')
      },
      { divider: true },
      {
        label: file.is_starred ? 'Remove star' : 'Add star',
        icon: file.is_starred ? <StarOff size={18} /> : <Star size={18} />,
        action: () => onStar && onStar(file.id)
      },
      { divider: true },
      {
        label: 'Move to trash',
        icon: <Trash2 size={18} />,
        action: () => onDelete && onDelete(file.id)
      }
    ];
  };

  return (
    <>
      <div
        ref={menuRef}
        className="drive-context-menu"
        style={{ left: x, top: y }}
      >
        {getMenuItems().map((item, index) => (
          item.divider ? (
            <div key={index} className="drive-menu-divider" />
          ) : (
            <div
              key={index}
              className="drive-menu-item"
              onClick={() => !item.hasSubmenu && handleItemClick(item.action)}
              onMouseEnter={() => item.hasSubmenu && handleSubmenuEnter(item.label)}
              onMouseLeave={() => item.hasSubmenu && handleSubmenuLeave()}
            >
              <div className="drive-menu-item-content">
                {item.icon && <span className="drive-menu-icon">{item.icon}</span>}
                <span className="drive-menu-label">{item.label}</span>
              </div>
              {item.hasSubmenu && (
                <ChevronRight size={16} className="drive-menu-chevron" />
              )}
            </div>
          )
        ))}
      </div>

      {openSubmenu && (
        <div
          ref={submenuRef}
          className="drive-context-menu drive-submenu"
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
        >
          {getMenuItems()
            .find(item => item.label === openSubmenu)?.submenu
            ?.map((subItem, index) => (
              subItem.divider ? (
                <div key={index} className="drive-menu-divider" />
              ) : (
                <div
                  key={index}
                  className="drive-menu-item"
                  onClick={() => handleItemClick(subItem.action)}
                >
                  <div className="drive-menu-item-content">
                    {subItem.icon && <span className="drive-menu-icon">{subItem.icon}</span>}
                    <span className="drive-menu-label">{subItem.label}</span>
                  </div>
                </div>
              )
            ))}
        </div>
      )}
    </>
  );
};

export default DriveContextMenu;

