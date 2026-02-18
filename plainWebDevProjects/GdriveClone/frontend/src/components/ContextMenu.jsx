import { useEffect, useRef } from 'react';
import {
  Download, Share2, Star, StarOff, Trash2, Edit3, Copy,
  Folder, Info, Link as LinkIcon, Eye
} from 'lucide-react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onClose, items, file, folder }) => {
  const menuRef = useRef(null);

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
    document.addEventListener('contextmenu', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position if menu goes off screen
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

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        item.divider ? (
          <div key={index} className="context-menu-divider" />
        ) : (
          <button
            key={index}
            className="context-menu-item"
            onClick={() => handleItemClick(item.action)}
            disabled={item.disabled}
          >
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            <span className="context-menu-label">{item.label}</span>
            {item.shortcut && (
              <span className="context-menu-shortcut">{item.shortcut}</span>
            )}
          </button>
        )
      ))}
    </div>
  );
};

export default ContextMenu;
