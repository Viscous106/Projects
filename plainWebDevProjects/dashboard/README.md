# Productify - Personal Productivity Dashboard

A beautiful, feature-rich productivity dashboard built with vanilla HTML, CSS, and JavaScript. Designed with modern aesthetics and multiple theme options.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen)

## 📋 Problem Statement

In today's fast-paced digital world, individuals struggle to manage multiple productivity tools scattered across different platforms. There's a need for a unified, lightweight, and accessible productivity dashboard that:

- **Centralizes task management** without requiring complex setup or external dependencies
- **Provides quick note-taking** capabilities that persist across sessions
- **Offers focus timer functionality** to improve productivity through time management
- **Displays contextual information** like weather and inspirational content
- **Works entirely offline** after initial load, with data persistence using browser storage
- **Requires no backend infrastructure** or user accounts, making it immediately usable

This project solves these problems by creating a single-page application that combines task management, note-taking, focus timing, and informational widgets into one cohesive interface, all built with vanilla JavaScript and DOM manipulation techniques.

## 🎯 Features Implemented

### Core Features
- ✅ **Task Manager** - Create, complete, delete, and filter tasks with real-time statistics
- ✅ **Quick Notes** - Persistent note-taking with character counting and clipboard copy
- ✅ **Focus Timer** - Pomodoro-style timer with visual ring animation and session tracking
- ✅ **Weather Widget** - Real-time weather based on geolocation
- ✅ **Daily Quotes** - Inspirational quotes from external API with fallback support
- ✅ **Theme System** - 8 color themes (5 dark, 3 light) with persistent preference
- ✅ **Data Persistence** - All data saved to LocalStorage (tasks, notes, theme, timer sessions)
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### User Experience Features
- ✅ Login screen with form validation
- ✅ Sidebar navigation with collapsible option
- ✅ Toast notifications for user feedback
- ✅ Empty state handling for all sections
- ✅ Error handling with user-friendly messages
- ✅ Input validation and duplicate prevention

## 🚀 Features

- **Task Manager** - Create, complete, and delete tasks with filtering options
- **Quick Notes** - Jot down thoughts with character counting and clipboard copy
- **Focus Timer** - Pomodoro-style timer with visual ring animation
- **Weather Widget** - Real-time weather based on your location
- **Daily Quotes** - Inspirational quotes from external API
- **8 Color Themes** - Dark and light theme variants

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure and accessibility |
| **CSS3** | Styling, animations, CSS variables for theming |
| **Vanilla JavaScript** | DOM manipulation, event handling, async APIs |
| **Lucide Icons** | Modern icon library via CDN |
| **Google Fonts** | Inter & JetBrains Mono typography |

## 📁 Project Structure

```
dashboard/
├── index.html      # Main HTML structure (483 lines)
├── style.css       # Complete styling & themes (2084 lines)
├── script.js       # Application logic (787 lines)
└── README.md       # Documentation
```

## 🏗️ Architecture

### HTML Structure
```
├── Login Page (#login-page)
│   ├── Login Card (form, inputs)
│   └── Theme Toggle Button
│
├── App Container (#app-container)
│   ├── Sidebar (#sidebar)
│   │   ├── Navigation Items
│   │   └── User Profile
│   │
│   └── Main Content (.main-content)
│       ├── Top Header
│       └── Page Views
│           ├── Dashboard View (widgets grid)
│           ├── Tasks View (fullscreen)
│           ├── Notes View (fullscreen)
│           └── Focus Timer View (fullscreen)
│
├── Theme Modal (#theme-modal)
└── Toast Notifications (#toast)
```

### CSS Architecture
- **CSS Custom Properties** for dynamic theming
- **8 Theme Definitions**: Catppuccin Mocha/Latte, Tokyo Night/Light, Gruvbox Dark, Nord, Dracula, GitHub Light
- **BEM-like naming** for component organization
- **Flexbox & CSS Grid** for layouts
- **CSS Animations** for smooth transitions

### JavaScript Modules

| Module | Description |
|--------|-------------|
| **DOM References** | Cached element selectors |
| **Page Navigation** | View switching logic |
| **Login System** | Authentication flow (demo) |
| **Clock & Greeting** | Real-time updates |
| **Weather API** | Async fetch with Open-Meteo |
| **Quote API** | Async fetch with Quotable |
| **Task Manager** | CRUD with event delegation |
| **Notes** | Input handling & clipboard |
| **Focus Timer** | Interval-based countdown |
| **Theme Switcher** | Dynamic CSS variable updates |

## 🌐 External APIs

| API | Endpoint | Purpose |
|-----|----------|---------|
| **IP-API** | `ipapi.co/json` | Geolocation for weather |
| **Open-Meteo** | `api.open-meteo.com` | Weather data |
| **Quotable** | `api.quotable.io` | Random quotes |

## 🎨 Available Themes

### Dark Themes
- Catppuccin Mocha (default)
- Tokyo Night
- Gruvbox Dark
- Nord
- Dracula

### Light Themes
- Catppuccin Latte
- Tokyo Light
- GitHub Light

## 📚 DOM Concepts Used

This project extensively demonstrates core DOM manipulation and JavaScript concepts as required by the syllabus:

### 1. DOM Basics (25 marks - Mandatory)

#### Element Selection
- **`document.querySelector()`** - Selects single elements (e.g., `#login-page`, `#task-list`)
- **`document.querySelectorAll()`** - Selects multiple elements (e.g., `.nav-item`, `.filter-btn`)
- **`element.closest()`** - Traverses up DOM tree to find parent elements (used in event delegation)

#### Element Creation & Manipulation
- **`document.createElement()`** - Dynamically creates task list items (`<li>`, `<span>`, `<button>`)
- **`element.appendChild()`** - Adds created elements to the DOM tree
- **`element.textContent`** - Sets/gets text content of elements
- **`element.innerHTML`** - Sets HTML content (for icons)
- **`element.setAttribute()`** - Sets attributes like `data-action`, `data-theme`
- **`element.getAttribute()`** - Retrieves attribute values

#### Class & Style Manipulation
- **`element.classList.add()`** - Adds CSS classes (e.g., `active`, `completed`, `hidden`)
- **`element.classList.remove()`** - Removes CSS classes
- **`element.classList.toggle()`** - Toggles CSS classes
- **`element.style.property`** - Direct style manipulation (e.g., `display`, `width`, `opacity`)

#### DOM Traversal
- **`element.querySelector()`** - Finds child elements within a parent
- **`element.querySelectorAll()`** - Finds all matching child elements
- **`element.parentElement`** - Accesses parent element

### 2. Event Handling (20 marks - Mandatory)

#### Event Listeners
- **`addEventListener('click')`** - Handles button clicks, navigation, task actions
- **`addEventListener('submit')`** - Handles form submissions (login form)
- **`addEventListener('keydown')`** - Handles keyboard events (Enter key for login/tasks)
- **`addEventListener('input')`** - Handles text input changes (notes character counting)
- **`addEventListener('keydown')` with Escape** - Closes modal on Escape key

#### Event Object Usage
- **`event.preventDefault()`** - Prevents default form submission behavior
- **`event.target`** - Identifies the element that triggered the event
- **`event.key`** - Detects specific keys (Enter, Escape)

### 3. Event Delegation (Recommended - Implemented)

- **Single listener on parent** (`#task-list`) handles all child button clicks
- Uses `event.target.closest('[data-action]')` to identify clicked buttons
- Efficiently manages dynamically added task items without attaching individual listeners
- Reduces memory usage and improves performance

### 4. Async/Await & Fetch API

- **`async function`** - Declares asynchronous functions
- **`await fetch()`** - Makes HTTP requests to external APIs
- **Error handling** - Try-catch blocks with user-friendly error messages
- **Timeout handling** - AbortController for request timeouts
- **Fallback mechanisms** - Graceful degradation when APIs fail

### 5. LocalStorage API (Data Persistence)

- **`localStorage.setItem()`** - Saves data (tasks, notes, theme, timer sessions)
- **`localStorage.getItem()`** - Retrieves saved data
- **`JSON.stringify()`** - Converts objects to strings for storage
- **`JSON.parse()`** - Converts stored strings back to objects
- **Error handling** - Try-catch blocks for storage operations

### 6. State Management

- **Application state variables** - `currentView`, `currentFilter`, `timerRunning`, etc.
- **State updates trigger DOM updates** - Changes in state reflect immediately in UI
- **Conditional rendering** - Shows/hides elements based on state

## 🚀 Steps to Run the Project

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari - latest versions)
- No server or build tools required - runs directly in the browser

### Running the Project

1. **Download/Clone the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd dashboard
   ```
   
   Or simply download the project files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

2. **Open in Browser**
   - **Option 1**: Double-click `index.html` to open in your default browser
   - **Option 2**: Right-click `index.html` → "Open with" → Select your browser
   - **Option 3**: Drag and drop `index.html` into a browser window
   - **Option 4**: Use a local server (optional):
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (with http-server)
     npx http-server
     
     # Then visit http://localhost:8000
     ```

3. **Login**
   - Enter any username (minimum 2 characters)
   - Enter any password (demo mode - no real authentication)
   - Click "Sign In" or press Enter

4. **Explore Features**
   - Navigate using the sidebar
   - Add tasks, write notes, use the focus timer
   - Change themes from the theme picker
   - All data is automatically saved to browser LocalStorage

### Testing Features

1. **Task Manager**
   - Add tasks using the input field
   - Mark tasks as complete
   - Delete tasks
   - Filter by All/Pending/Completed
   - Refresh page - tasks persist!

2. **Quick Notes**
   - Type in the notes textarea
   - Character count updates automatically
   - Copy to clipboard
   - Clear all notes
   - Refresh page - notes persist!

3. **Focus Timer**
   - Select a preset time (25/15/5/1 minutes)
   - Start the timer
   - Complete sessions are tracked
   - Refresh page - session count persists!

4. **Theme Switching**
   - Click theme button in header or sidebar
   - Select from 8 available themes
   - Refresh page - theme preference persists!

### Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)
- ⚠️ Internet Explorer - Not supported (uses modern JavaScript features)

## 📱 Responsive Design

- **Desktop**: Full sidebar with collapsible option
- **Tablet** (≤900px): Hidden sidebar with hamburger menu
- **Mobile** (≤500px): Optimized layouts and touch-friendly

## 🔧 Customization

### Adding a New Theme
```css
[data-theme="your-theme"] {
    --bg-base: #hex;
    --bg-surface: #hex;
    --text-main: #hex;
    --accent: #hex;
    /* ... other variables */
}
```

### Adding New Icons
Uses [Lucide Icons](https://lucide.dev/) - add via:
```html
<i data-lucide="icon-name"></i>
```

## ⚠️ Known Limitations

### Technical Limitations

1. **No Backend/Server**
   - All data is stored in browser LocalStorage
   - Data is browser-specific (won't sync across devices)
   - Clearing browser data will delete all saved information
   - No user accounts or authentication system

2. **API Dependencies**
   - Weather widget requires internet connection and geolocation access
   - Quote widget requires internet connection
   - If APIs are down, fallback mechanisms are in place
   - Weather API may be rate-limited

3. **Browser Storage Limits**
   - LocalStorage typically limited to 5-10MB per domain
   - Very large notes or many tasks may hit storage limits
   - No automatic data backup or export functionality

4. **No Data Export/Import**
   - Cannot export tasks or notes to file
   - Cannot import data from external sources
   - No data migration between browsers

5. **Single User Only**
   - No multi-user support
   - No data sharing capabilities
   - Each browser profile has separate data

6. **No Offline API Caching**
   - Weather and quotes require active internet connection
   - No service worker for offline functionality
   - API failures result in fallback content

### Feature Limitations

1. **Task Management**
   - No task priorities or due dates
   - No task categories or tags
   - No task search functionality
   - No task editing (must delete and recreate)
   - Maximum task length: 200 characters

2. **Notes**
   - Plain text only (no formatting)
   - No note organization or folders
   - No note search functionality
   - No note version history

3. **Timer**
   - No break timer functionality
   - No timer history or statistics
   - Timer resets on page refresh (doesn't persist running state)
   - No sound notifications

4. **Weather**
   - Only shows current weather (no forecast)
   - Location based on IP geolocation (may be inaccurate)
   - No manual location selection

### Browser-Specific Limitations

1. **Clipboard API**
   - Requires HTTPS or localhost for clipboard access
   - Older browsers may not support `navigator.clipboard`
   - Fallback uses `document.execCommand('copy')` (deprecated)

2. **Geolocation**
   - Requires user permission for location access
   - May be blocked by browser privacy settings
   - IP-based geolocation may be inaccurate

3. **LocalStorage**
   - Can be disabled by browser settings
   - Private/Incognito mode may have restrictions
   - Some browsers may clear data on exit

### Future Improvements (Not Implemented)

- [ ] Task editing functionality
- [ ] Task priorities and due dates
- [ ] Data export/import (JSON)
- [ ] Break timer for Pomodoro technique
- [ ] Sound notifications for timer
- [ ] Weather forecast (multi-day)
- [ ] Note formatting (markdown support)
- [ ] Search functionality
- [ ] Keyboard shortcuts documentation
- [ ] PWA support (offline mode)

## 📄 License

MIT License - Feel free to use and modify!

---

Built with ❤️ using vanilla web technologies
