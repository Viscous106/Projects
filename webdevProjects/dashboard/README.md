# Productify - Personal Productivity Dashboard

A beautiful, feature-rich productivity dashboard built with vanilla HTML, CSS, and JavaScript. Designed with modern aesthetics and multiple theme options.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen)

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

## 📚 JavaScript Concepts Demonstrated

Per syllabus requirements:

1. **DOM Basics**
   - `document.querySelector()` / `querySelectorAll()`
   - `createElement()` / `appendChild()`

2. **Events**
   - `addEventListener()` with 'click', 'keydown', 'input', 'submit'

3. **Event Delegation**
   - Single listener on `#task-list` handles all task button clicks

4. **Async/Await**
   - `fetchWeather()` - Weather API integration
   - `fetchQuote()` - Quote API integration

## 🚀 Getting Started

1. Clone or download the project
2. Open `index.html` in any modern browser
3. Login with any username/password (demo mode)
4. Explore the dashboard!

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

## 📄 License

MIT License - Feel free to use and modify!

---

Built with ❤️ using vanilla web technologies
