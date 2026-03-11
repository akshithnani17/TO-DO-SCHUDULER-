/* --- STATE --- */
const state = {
    currentUser: null,
    tasks: [],
    selectedDate: '',
    dailyQuote: ''
};

/* --- QUOTES DATABASE --- */
const dailyMotivations = [
    "The secret of your future is hidden in your daily routine.",
    "Don't stop when you're tired. Stop when you're done.",
    "Your future is created by what you do today, not tomorrow.",
    "Discipline is doing what needs to be done, even if you don't want to do it.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Focus on the step in front of you, not the whole staircase.",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "What you do today can improve all your tomorrows.",
    "A year from now you'll wish you had started today.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear."
];

/* --- DOM ELEMENTS --- */
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');

const setupMode = document.getElementById('setup-mode');
const emailSuccessScreen = document.getElementById('email-success-screen');
const executionMode = document.getElementById('execution-mode');
const resultScreen = document.getElementById('result-screen');

const planDateInput = document.getElementById('plan-date');
const taskNameInput = document.getElementById('task-name-input');
const taskTimeInput = document.getElementById('task-time-input');
const addTaskBtn = document.getElementById('add-task-btn');
const planningList = document.getElementById('planning-list');
const generateBtn = document.getElementById('generate-btn');

// Motivation Elements
const planningMotivationEl = document.getElementById('planning-motivation');
const confirmMotivationEl = document.getElementById('confirm-motivation');
const emailDisplayText = document.getElementById('email-display-text');
const goToChecklistBtn = document.getElementById('go-to-checklist-btn');

const executionList = document.getElementById('execution-list');
const executionDateTitle = document.getElementById('execution-date-title');
const finishDayBtn = document.getElementById('finish-day-btn');

const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

/* --- INIT --- */
window.addEventListener('DOMContentLoaded', () => {
    // 1. Generate Daily Quote immediately
    const randomIndex = Math.floor(Math.random() * dailyMotivations.length);
    state.dailyQuote = dailyMotivations[randomIndex];
    planningMotivationEl.textContent = state.dailyQuote;
    
    // 2. Set Date Input to Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    planDateInput.value = `${yyyy}-${mm}-${dd}`;
    state.selectedDate = `${yyyy}-${mm}-${dd}`;

    // 3. Check Session (If logged in, go to dashboard, else stay on Login)
    checkSession();
});

/* --- AUTH --- */
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = userIdInput.value.trim();
    const pass = passwordInput.value.trim();
    if(!id || pass.length < 4) {
        loginError.textContent = "Invalid ID or Password.";
        return;
    }
    loginUser(id);
});

function loginUser(id) {
    state.currentUser = id;
    localStorage.setItem('lifeplanner_user', id);
    
    // Switch Views
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    
    userGreeting.textContent = `Hello, ${id.includes('@') ? id.split('@')[0] : id}`;
    loadData();
}

/* --- LOGOUT LOGIC (UPDATED) --- */
logoutBtn.addEventListener('click', () => {
    // 1. Clear Local Storage
    localStorage.removeItem('lifeplanner_user');
    
    // 2. Clear State
    state.currentUser = null;
    state.tasks = [];
    
    // 3. Switch Views back to Login
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    
    // 4. Clear Form Inputs
    userIdInput.value = "";
    passwordInput.value = "";
    loginError.textContent = "";
    
    // 5. Feedback
    showToast("Logged out successfully");
});

function checkSession() {
    const u = localStorage.getItem('lifeplanner_user');
    if(u) {
        // Auto-login if session exists
        loginUser(u);
    } else {
        // Ensure we are on login view (Default)
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
}

/* --- TASK PLANNING --- */
addTaskBtn.addEventListener('click', () => {
    const name = taskNameInput.value.trim();
    const time = taskTimeInput.value;
    
    if(!name) return showToast("Please select or type a task name!");

    addTask(name, time);
    taskNameInput.value = ""; 
});

window.quickAdd = (name) => {
    taskNameInput.value = name;
    taskNameInput.focus(); 
    showToast(`Selected "${name}". Please pick a time now.`);
};

function addTask(name, time) {
    const task = {
        id: Date.now(),
        name: name,
        time: time,
        completed: false
    };
    state.tasks.push(task);
    saveData();
    renderPlanningList();
}

function renderPlanningList() {
    planningList.innerHTML = '';
    if(state.tasks.length === 0) {
        planningList.innerHTML = '<div class="empty-state">No tasks yet. Select from above!</div>';
        return;
    }
    
    state.tasks.sort((a,b) => a.time.localeCompare(b.time));

    state.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <div class="task-info">
                <span class="task-time">${formatTime(task.time)}</span>
                <span class="task-name">${task.name}</span>
            </div>
            <button class="delete-btn" onclick="removeTask(${task.id})">&times;</button>
        `;
        planningList.appendChild(div);
    });
}

window.removeTask = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
    renderPlanningList();
};

/* --- GENERATE & EMAIL SIMULATION --- */
generateBtn.addEventListener('click', () => {
    if(state.tasks.length === 0) return showToast("Add at least one task!");

    confirmMotivationEl.textContent = `"${state.dailyQuote}"`;

    emailDisplayText.textContent = state.currentUser; 
    setupMode.classList.add('hidden');
    emailSuccessScreen.classList.remove('hidden');

    showToast("Sending schedule to email...");
    setTimeout(() => {
        showToast("✅ Sent to " + state.currentUser);
    }, 1500);
});

goToChecklistBtn.addEventListener('click', () => {
    emailSuccessScreen.classList.add('hidden');
    executionMode.classList.remove('hidden');
    
    const d = new Date(planDateInput.value);
    executionDateTitle.textContent = `Schedule for ${d.toDateString()}`;
    
    renderExecutionList();
});

/* --- EXECUTION & CHECKBOXES --- */
function renderExecutionList() {
    executionList.innerHTML = '';
    state.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="task-info">
                <span class="task-time">${formatTime(task.time)}</span>
                <span class="task-name">${task.name}</span>
            </div>
            <div class="custom-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask(${task.id})">
                 ${task.completed ? '✔' : ''}
            </div>
        `;
        executionList.appendChild(div);
    });
}

window.toggleTask = (id) => {
    const t = state.tasks.find(x => x.id === id);
    if(t) {
        t.completed = !t.completed;
        saveData();
        renderExecutionList();
    }
};

/* --- FINISH DAY & RESULTS --- */
finishDayBtn.addEventListener('click', () => {
    executionMode.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;

    if(total === completed && total > 0) {
        // SUCCESS
        resultIcon.textContent = "🏆";
        resultTitle.textContent = "Congratulations!";
        resultMessage.textContent = "You completed every single task on time. You are unstoppable today!";
        resultTitle.style.color = "var(--success)";
    } else {
        // MOTIVATION FOR MISSED TASKS
        resultIcon.textContent = "🔥";
        resultTitle.textContent = "Keep Pushing!";
        resultMessage.textContent = `You completed ${completed}/${total} tasks. Don't worry about what you missed today. Focus on doing better tomorrow. You've got this!`;
        resultTitle.style.color = "var(--primary)";
    }
});

window.resetApp = () => {
    state.tasks = []; // Clear for new day
    saveData();
    resultScreen.classList.add('hidden');
    setupMode.classList.remove('hidden');
    renderPlanningList();
};

/* --- HELPERS --- */
function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function saveData() {
    if(!state.currentUser) return;
    localStorage.setItem(`lifeplanner_data_${state.currentUser}`, JSON.stringify(state.tasks));
}

function loadData() {
    const saved = localStorage.getItem(`lifeplanner_data_${state.currentUser}`);
    if(saved) {
        state.tasks = JSON.parse(saved);
        renderPlanningList();
    }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = "show";
    setTimeout(() => t.className = t.className.replace("show", ""), 3000);
}