/**
 * Productify - Enhanced Personal Productivity Dashboard
 * 
 * JavaScript Topics Demonstrated (Per Syllabus):
 * =============================================
 * 1. DOM BASICS: document.querySelector, createElement, appendChild
 * 2. EVENTS: addEventListener with 'click' and 'keydown'
 * 3. EVENT DELEGATION: Parent <ul> handles child button clicks
 * 4. ASYNC/AWAIT: Fetching quotes and weather from external APIs
 */

// Initialize Lucide icons
lucide.createIcons();

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Login Page
const loginPage = document.querySelector('#login-page');
const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

// App Container
const appContainer = document.querySelector('#app-container');

// Sidebar
const sidebar = document.querySelector('#sidebar');
const sidebarToggle = document.querySelector('#sidebar-toggle');
const navItems = document.querySelectorAll('.nav-item[data-section]');
const themeNavBtn = document.querySelector('#theme-nav-btn');
const logoutBtn = document.querySelector('#logout-btn');
const userDisplayName = document.querySelector('#user-display-name');
const sidebarLogo = document.querySelector('#sidebar-logo');

// Header
const mobileMenuBtn = document.querySelector('#mobile-menu-btn');
const headerClock = document.querySelector('#header-clock');
const headerDate = document.querySelector('#header-date');
const headerThemeBtn = document.querySelector('#header-theme-btn');
const pageTitle = document.querySelector('#page-title');

// Page Views
const pageViews = {
    dashboard: document.querySelector('#view-dashboard'),
    tasks: document.querySelector('#view-tasks'),
    notes: document.querySelector('#view-notes'),
    focus: document.querySelector('#view-focus')
};

// Dashboard Elements
const greetingElement = document.querySelector('#greeting');
const mainClock = document.querySelector('#main-clock');
const mainDate = document.querySelector('#main-date');
const weatherIcon = document.querySelector('#weather-icon');
const weatherTemp = document.querySelector('#weather-temp');
const weatherDesc = document.querySelector('#weather-desc');
const weatherLocation = document.querySelector('#weather-location');
const weatherHumidity = document.querySelector('#weather-humidity');
const weatherWind = document.querySelector('#weather-wind');
const refreshWeatherBtn = document.querySelector('#refresh-weather');
const quoteText = document.querySelector('#quote-text');
const quoteAuthor = document.querySelector('#quote-author');
const refreshQuoteBtn = document.querySelector('#refresh-quote');
const dashTotalTasks = document.querySelector('#dash-total-tasks');
const dashCompletedTasks = document.querySelector('#dash-completed-tasks');
const dashPendingTasks = document.querySelector('#dash-pending-tasks');
const dashProgressFill = document.querySelector('#dash-progress-fill');
const dashProgressText = document.querySelector('#dash-progress-text');
const quickActionBtns = document.querySelectorAll('.quick-action-btn');

// Task Page Elements
const taskInput = document.querySelector('#task-input');
const addTaskBtn = document.querySelector('#add-task-btn');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCountEl = document.querySelector('#task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.querySelector('#total-tasks');
const completedTasksEl = document.querySelector('#completed-tasks');
const progressFill = document.querySelector('#progress-fill');
const progressText = document.querySelector('#progress-text');

// Notes Page Elements
const quickNotes = document.querySelector('#quick-notes');
const charCount = document.querySelector('#char-count');
const clearNotesBtn = document.querySelector('#clear-notes');
const copyNotesBtn = document.querySelector('#copy-notes');

// Timer Page Elements
const timerMinutes = document.querySelector('#timer-minutes');
const timerSeconds = document.querySelector('#timer-seconds');
const timerStartBtn = document.querySelector('#timer-start');
const timerResetBtn = document.querySelector('#timer-reset');
const presetBtns = document.querySelectorAll('.preset-btn');
const sessionCountEl = document.querySelector('#session-count');
const timerProgress = document.querySelector('#timer-progress');

// Theme Modal
const themeModal = document.querySelector('#theme-modal');
const closeModalBtn = document.querySelector('#close-modal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const themeOptions = document.querySelectorAll('.theme-option');
const loginThemeBtn = document.querySelector('#login-theme-btn');

// Toast
const toast = document.querySelector('#toast');
const toastMessage = document.querySelector('#toast-message');

// ============================================
// PAGE VIEW SWITCHING
// ============================================

let currentView = 'dashboard';

const pageTitles = {
    dashboard: 'Dashboard',
    tasks: 'Task Manager',
    notes: 'Quick Notes',
    focus: 'Focus Timer'
};

function switchView(viewName) {
    // Hide all views
    Object.values(pageViews).forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    if (pageViews[viewName]) {
        pageViews[viewName].classList.add('active');
        currentView = viewName;

        // Update header title
        pageTitle.textContent = pageTitles[viewName] || 'Dashboard';

        // Update nav active state
        navItems.forEach(nav => {
            if (nav.getAttribute('data-section') === viewName) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Re-render Lucide icons
        lucide.createIcons();
    }
}

// Navigation clicks
navItems.forEach(function (item) {
    item.addEventListener('click', function () {
        const section = item.getAttribute('data-section');
        switchView(section);

        // Close sidebar on mobile
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
        }
    });
});

// Quick action buttons
quickActionBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const action = btn.getAttribute('data-action');

        if (action === 'open-tasks') {
            switchView('tasks');
        } else if (action === 'open-notes') {
            switchView('notes');
        } else if (action === 'open-focus') {
            switchView('focus');
        } else if (action === 'open-themes') {
            openThemeModal();
        }
    });
});

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = 'toast show';
    if (type !== 'success') {
        toast.classList.add(type);
    }
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

function performLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === '' || password === '') {
        loginForm.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);
        return;
    }

    userDisplayName.textContent = username;
    loginPage.style.display = 'none';
    appContainer.style.display = 'flex';
    appContainer.classList.remove('hidden');

    lucide.createIcons();
    taskInput.focus();

    fetchWeather();
    fetchQuote();

    showToast(`Welcome back, ${username}! 👋`);
}

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    performLogin();
});

const loginBtn = document.querySelector('#login-btn');
loginBtn.addEventListener('click', function (event) {
    event.preventDefault();
    performLogin();
});

// Shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

usernameInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performLogin();
    }
});

passwordInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performLogin();
    }
});

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

sidebarToggle.addEventListener('click', function () {
    sidebar.classList.toggle('collapsed');
});

sidebarLogo.addEventListener('click', function () {
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
    }
});

mobileMenuBtn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', function (event) {
    if (window.innerWidth <= 900) {
        if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    }
});

logoutBtn.addEventListener('click', function () {
    usernameInput.value = '';
    passwordInput.value = '';
    appContainer.style.display = 'none';
    loginPage.style.display = 'flex';
    usernameInput.focus();
    showToast('Logged out successfully');
});

// ============================================
// CLOCK & GREETING
// ============================================

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    mainClock.textContent = `${hours}:${minutes}:${seconds}`;
    headerClock.textContent = `${hours}:${minutes}`;

    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const shortDateOptions = { weekday: 'short' };

    mainDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    headerDate.textContent = now.toLocaleDateString('en-US', shortDateOptions);

    updateGreeting(now.getHours());
}

function updateGreeting(hour) {
    let greeting;
    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning ☀️';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon 🌤️';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening 🌅';
    } else {
        greeting = 'Good Night 🌙';
    }
    greetingElement.textContent = greeting;
}

updateClock();
setInterval(updateClock, 1000);

// ============================================
// WEATHER API - ASYNC/AWAIT
// ============================================

const weatherCodes = {
    0: { icon: '☀️', desc: 'Clear sky' },
    1: { icon: '🌤️', desc: 'Mainly clear' },
    2: { icon: '⛅', desc: 'Partly cloudy' },
    3: { icon: '☁️', desc: 'Overcast' },
    45: { icon: '🌫️', desc: 'Foggy' },
    48: { icon: '🌫️', desc: 'Depositing rime fog' },
    51: { icon: '🌧️', desc: 'Light drizzle' },
    53: { icon: '🌧️', desc: 'Moderate drizzle' },
    55: { icon: '🌧️', desc: 'Dense drizzle' },
    61: { icon: '🌧️', desc: 'Slight rain' },
    63: { icon: '🌧️', desc: 'Moderate rain' },
    65: { icon: '🌧️', desc: 'Heavy rain' },
    71: { icon: '❄️', desc: 'Slight snow' },
    73: { icon: '❄️', desc: 'Moderate snow' },
    75: { icon: '❄️', desc: 'Heavy snow' },
    80: { icon: '🌦️', desc: 'Rain showers' },
    95: { icon: '⛈️', desc: 'Thunderstorm' }
};

async function fetchWeather() {
    weatherDesc.textContent = 'Loading...';

    try {
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();

        const lat = geoData.latitude;
        const lon = geoData.longitude;
        const city = geoData.city || 'Unknown';
        const country = geoData.country_name || '';

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const code = current.weather_code;
        const weather = weatherCodes[code] || { icon: '🌡️', desc: 'Unknown' };

        weatherIcon.textContent = weather.icon;
        weatherTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
        weatherDesc.textContent = weather.desc;
        weatherLocation.textContent = `${city}, ${country}`;
        weatherHumidity.textContent = `${current.relative_humidity_2m}%`;
        weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherIcon.textContent = '🌡️';
        weatherTemp.textContent = '--°C';
        weatherDesc.textContent = 'Unable to load';
        weatherLocation.textContent = 'Check connection';
    }
}

refreshWeatherBtn.addEventListener('click', function () {
    fetchWeather();
    showToast('Weather refreshed');
});

// ============================================
// QUOTE API - ASYNC/AWAIT
// ============================================

async function fetchQuote() {
    quoteText.textContent = 'Loading inspiration...';
    quoteAuthor.textContent = '';

    try {
        const response = await fetch('https://api.quotable.io/random?tags=technology|wisdom|inspirational');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        quoteText.textContent = data.content;
        quoteAuthor.textContent = `— ${data.author}`;

    } catch (error) {
        const fallbackQuotes = [
            { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
            { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
            { content: "Programs must be written for people to read.", author: "Harold Abelson" },
            { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
            { content: "Make it work, make it right, make it fast.", author: "Kent Beck" },
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
        ];

        const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        quoteText.textContent = randomFallback.content;
        quoteAuthor.textContent = `— ${randomFallback.author}`;
    }
}

fetchQuote();
refreshQuoteBtn.addEventListener('click', function () {
    fetchQuote();
    showToast('New quote loaded');
});

// ============================================
// TASK LIST - EVENT DELEGATION
// ============================================

let currentFilter = 'all';

function createTaskElement(taskText) {
    // DOM BASICS: createElement
    const li = document.createElement('li');
    li.className = 'task-item';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = taskText;

    const doneBtn = document.createElement('button');
    doneBtn.className = 'task-btn done-btn';
    doneBtn.setAttribute('data-action', 'done');
    doneBtn.innerHTML = '<i data-lucide="check"></i>';
    doneBtn.title = 'Mark as done';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete-btn';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.title = 'Delete task';

    // DOM BASICS: appendChild
    li.appendChild(textSpan);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    lucide.createIcons();

    return li;
}

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        taskInput.focus();
        return;
    }

    const taskElement = createTaskElement(taskText);
    taskList.appendChild(taskElement);
    taskInput.value = '';
    taskInput.focus();

    updateEmptyState();
    updateStats();
    applyFilter();

    showToast('Task added');
}

function updateEmptyState() {
    const visibleTasks = taskList.querySelectorAll('.task-item:not([style*="display: none"])');
    const allTasks = taskList.querySelectorAll('.task-item');

    if (allTasks.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.querySelector('p').textContent = 'No tasks yet';
    } else if (visibleTasks.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.querySelector('p').textContent = `No ${currentFilter} tasks`;
    } else {
        emptyState.classList.add('hidden');
    }
}

function updateStats() {
    const allTasks = taskList.querySelectorAll('.task-item');
    const completedTasks = taskList.querySelectorAll('.task-item.completed');

    const total = allTasks.length;
    const completed = completedTasks.length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Task page stats
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Complete`;
    taskCountEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;

    // Dashboard stats
    dashTotalTasks.textContent = total;
    dashCompletedTasks.textContent = completed;
    dashPendingTasks.textContent = pending;
    dashProgressFill.style.width = `${percentage}%`;
    dashProgressText.textContent = `${percentage}% Complete`;
}

function applyFilter() {
    const tasks = taskList.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const isCompleted = task.classList.contains('completed');

        if (currentFilter === 'all') {
            task.style.display = '';
        } else if (currentFilter === 'completed') {
            task.style.display = isCompleted ? '' : 'none';
        } else if (currentFilter === 'pending') {
            task.style.display = isCompleted ? 'none' : '';
        }
    });

    updateEmptyState();
}

// EVENT DELEGATION: Single listener on parent
taskList.addEventListener('click', function (event) {
    const clickedElement = event.target.closest('[data-action]');

    if (!clickedElement) return;

    const action = clickedElement.getAttribute('data-action');
    const taskItem = clickedElement.closest('.task-item');

    if (!taskItem) return;

    if (action === 'done') {
        taskItem.classList.toggle('completed');
        updateStats();
        applyFilter();

        if (taskItem.classList.contains('completed')) {
            showToast('Task completed! 🎉');
        }

    } else if (action === 'delete') {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(20px)';
        taskItem.style.transition = 'all 0.3s ease';

        setTimeout(function () {
            taskItem.remove();
            updateEmptyState();
            updateStats();
            showToast('Task deleted');
        }, 300);
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        applyFilter();
    });
});

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// ============================================
// NOTES FUNCTIONALITY
// ============================================

quickNotes.addEventListener('input', function () {
    const count = quickNotes.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
});

clearNotesBtn.addEventListener('click', function () {
    if (quickNotes.value.trim() !== '') {
        quickNotes.value = '';
        charCount.textContent = '0 characters';
        showToast('Notes cleared');
    }
});

copyNotesBtn.addEventListener('click', function () {
    if (quickNotes.value.trim() !== '') {
        navigator.clipboard.writeText(quickNotes.value).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    } else {
        showToast('Nothing to copy', 'warning');
    }
});

// ============================================
// FOCUS TIMER WITH RING ANIMATION
// ============================================

let timerInterval = null;
let timerRunning = false;
let timerRemaining = 25 * 60;
let timerTotal = 25 * 60;
let sessionCount = 0;
let currentPreset = 25;

const circumference = 2 * Math.PI * 90; // 565.48

function updateTimerDisplay() {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;

    timerMinutes.textContent = String(mins).padStart(2, '0');
    timerSeconds.textContent = String(secs).padStart(2, '0');

    // Update ring progress
    const progress = timerRemaining / timerTotal;
    const offset = circumference * (1 - progress);
    timerProgress.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerStartBtn.innerHTML = '<i data-lucide="play"></i><span>Resume</span>';
        lucide.createIcons();
    } else {
        timerRunning = true;
        timerStartBtn.innerHTML = '<i data-lucide="pause"></i><span>Pause</span>';
        lucide.createIcons();

        timerInterval = setInterval(function () {
            timerRemaining--;

            if (timerRemaining <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                timerStartBtn.innerHTML = '<i data-lucide="play"></i><span>Start Focus</span>';
                lucide.createIcons();
                timerRemaining = 0;

                sessionCount++;
                sessionCountEl.textContent = sessionCount;

                showToast('🎉 Focus session complete! Time for a break.');
            }

            updateTimerDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerRemaining = currentPreset * 60;
    timerTotal = currentPreset * 60;
    timerStartBtn.innerHTML = '<i data-lucide="play"></i><span>Start Focus</span>';
    lucide.createIcons();
    updateTimerDisplay();
}

timerStartBtn.addEventListener('click', toggleTimer);
timerResetBtn.addEventListener('click', resetTimer);

presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const time = parseInt(btn.getAttribute('data-time'));
        currentPreset = time;
        timerRemaining = time * 60;
        timerTotal = time * 60;
        clearInterval(timerInterval);
        timerRunning = false;
        timerStartBtn.innerHTML = '<i data-lucide="play"></i><span>Start Focus</span>';
        lucide.createIcons();
        updateTimerDisplay();
    });
});

updateTimerDisplay();

// ============================================
// THEME SWITCHING
// ============================================

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);

    themeOptions.forEach(function (option) {
        if (option.getAttribute('data-theme') === themeName) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function openThemeModal() {
    themeModal.classList.remove('hidden');
}

function closeThemeModal() {
    themeModal.classList.add('hidden');
}

headerThemeBtn.addEventListener('click', openThemeModal);
themeNavBtn.addEventListener('click', openThemeModal);
loginThemeBtn.addEventListener('click', openThemeModal);

closeModalBtn.addEventListener('click', closeThemeModal);
modalBackdrop.addEventListener('click', closeThemeModal);

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !themeModal.classList.contains('hidden')) {
        closeThemeModal();
    }
});

themeOptions.forEach(function (option) {
    option.addEventListener('click', function () {
        const themeName = option.getAttribute('data-theme');
        setTheme(themeName);
        showToast(`Theme: ${themeName.replace('-', ' ')}`);
    });
});

setTheme('catppuccin-mocha');

// ============================================
// INITIALIZATION
// ============================================

updateEmptyState();
updateStats();

console.log('🚀 Productify Dashboard loaded!');
console.log('📝 Syllabus topics: querySelector, createElement, appendChild, addEventListener, Event Delegation, Async/Await');
console.log('🎨 Libraries: Lucide Icons');
console.log('🌐 APIs: Open-Meteo Weather, IP-API Geolocation, Quotable Quotes');
