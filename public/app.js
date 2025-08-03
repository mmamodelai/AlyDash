// app.js - Enhanced client-side functionality

let currentData = {};
let currentTab = 'dashboard';

/**
 * Set status message (make available globally)
 */
function setStatus(message, type = 'success') {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.className = type;
    } else {
        console.log(`Status (${type}): ${message}`);
    }
}

// Make setStatus available globally immediately
window.setStatus = setStatus;

/**
 * Initialize the main application (called after authentication)
 */
function initMainApp() {
    console.log('Initializing main app');
    
    setupEventListeners();
    loadPinnedPatient();
    
    // Load dashboard by default
    setTimeout(() => {
        switchTab('dashboard', document.querySelector('[data-tab="dashboard"]'));
    }, 100);
    
    setStatus('Local Mode Active - Ready', 'success');
}

/**
 * Setup event listeners for UI interactions
 */
function setupEventListeners() {
    // Tab switching - fix the event handling
    const tabs = document.querySelectorAll('#sidebar li');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            if (tabName) {
                switchTab(tabName, tab);
            }
        });
    });

    // Search functionality
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        let searchTimeout;
        searchBar.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300); // Debounce search
        });
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName, tabElement) {
    console.log('Switching to tab:', tabName);
    
    // Update active tab styling
    document.querySelectorAll('#sidebar li').forEach(t => t.classList.remove('active'));
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Show the main content area
    const content = document.getElementById('content');
    if (content) {
        content.style.display = 'block';
    }
    
    // Load content based on tab
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'active-data':
            loadActivePatients();
            break;
        case 'active-todo':
            loadActiveTodo();
            break;
        case 'todos':
            loadTodos();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'closed':
            showPlaceholder('Closed Cases', 'This will show completed patient cases');
            break;
        case 'outstanding':
            showPlaceholder('Outstanding Cases', 'This will show pending/outstanding items');
            break;
        case 'outreach':
            showPlaceholder('Past Patient Outreach', 'This will show outreach to past patients\' contacts');
            break;
        case 'docs':
            showPlaceholder('Consulting Docs', 'This will show the consulting doctors directory');
            break;
        case 'calllog':
            showPlaceholder('Call Log', 'This will show interaction logs');
            break;
        case 'vendors':
            loadVendors();
            break;
        case 'chat':
            loadChat();
            break;
        case 'alyssa-notes':
            loadUserTasks('Alyssa');
            break;
        case 'moore-notes':
            loadUserTasks('Dr. Moore');
            break;
        case 'christa-notes':
            loadUserTasks('Christa');
            break;
        case 'amber-notes':
            loadUserTasks('Amber');
            break;
        case 'notes':
            loadAllNotes();
            break;
        case 'timelines':
            loadPatientTimelines();
            break;
        default:
            console.log('Unknown tab:', tabName);
            showPlaceholder('Unknown Tab', 'Content not implemented yet');
    }
}

/**
 * Generate HTML table for patient data with improved columns
 */
function generatePatientTable(data) {
    if (!data || data.length === 0) {
        return '<p>No data available.</p>';
    }
    
    // Use the important columns that we know exist in the data
    const importantColumns = ['Patient Name', 'Age', 'Area', 'CP Doctor', 'Hospice', 'PAID', 'Check list'];
    
    let html = '<table class="data-table"><thead><tr>';
    importantColumns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '<th>Actions</th></tr></thead><tbody>';
    
    data.forEach((patient, index) => {
        html += '<tr>';
        importantColumns.forEach(col => {
            let value = patient[col] || '-';
            // Add some basic formatting
            if (col === 'PAID' && value === 'yes') {
                value = '✅ Yes';
            } else if (col === 'PAID' && value === 'no') {
                value = '❌ No';
            } else if (col === 'Check list' && value === 'complete') {
                value = '✅ Complete';
            }
            html += `<td>${value}</td>`;
        });
        
        // Add actions column
        html += `
            <td>
                <div class="patient-actions">
                    <button class="patient-action-btn pin" onclick="pinPatient(${index})" title="Pin patient">📌</button>
                    <button class="patient-action-btn task" onclick="createTaskForPatient(${index})" title="Create task">📝</button>
                    <button class="patient-action-btn calendar" onclick="createEventForPatient(${index})" title="Create calendar event">📅</button>
                </div>
            </td>
        `;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

/**
 * Generate progress indicator based on patient data
 */
function generateProgressIndicator(patient) {
    let progress = 0;
    let total = 8;
    
    // Check various completion indicators
    if (patient['CP Completed'] && patient['CP Completed'].toLowerCase() === 'complete') progress++;
    if (patient['RXNT Info'] && patient['RXNT Info'].toLowerCase() === 'complete') progress++;
    if (patient['WR'] && patient['WR'].toLowerCase() === 'yes') progress++;
    if (patient['Prescription Submit']) progress++;
    if (patient['PAID'] && patient['PAID'].toLowerCase() === 'yes') progress++;
    if (patient['Check list'] && patient['Check list'].toLowerCase() === 'complete') progress++;
    if (patient['Consent Received'] && patient['Consent Received'].toLowerCase() === 'yes') progress++;
    if (patient['Medical Records'] && patient['Medical Records'].toLowerCase() === 'yes') progress++;
    
    const percentage = Math.round((progress / total) * 100);
    
    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="progress-text">${progress}/${total}</span>
    `;
}

/**
 * Get status class for styling
 */
function getStatusClass(status) {
    if (!status) return 'status-unknown';
    const statusLower = status.toLowerCase();
    if (statusLower === 'complete') return 'status-complete';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower.includes('progress')) return 'status-progress';
    return 'status-default';
}

/**
 * Load dashboard with summary cards using data
 */
async function loadDashboard() {
    showLoading();
    
    try {
        // Fetch data from server (same as simple-app.html)
        const response = await fetch('/api/read-active?spreadsheetId=local');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('No data received from server');
        }
        
        // Store data globally
        currentData.active = data;
        
        // Calculate metrics (same as simple-app.html)
        const avgAge = calculateAverageAge(data);
        const paidCount = countPaidInvoices(data);
        const completedCount = countCompletedCases(data);
        
        // Create dashboard content
        const content = document.getElementById('content');
        content.innerHTML = `
            <h1>Dashboard Overview</h1>
            <div class="dashboard-cards">
                <div class="card">
                    <h3>Active Patients</h3>
                    <div class="number">${data.length}</div>
                    <p>Currently active cases</p>
                </div>
                <div class="card">
                    <h3>Average Age</h3>
                    <div class="number">${avgAge}</div>
                    <p>Years old</p>
                </div>
                <div class="card">
                    <h3>Paid Invoices</h3>
                    <div class="number">${paidCount}</div>
                    <p>Out of ${data.length} total</p>
                </div>
                <div class="card">
                    <h3>Completed Cases</h3>
                    <div class="number">${completedCount}</div>
                    <p>CP completed</p>
                </div>
            </div>
            
            <h2>Recent Active Patients</h2>
            ${generatePatientTable(data.slice(0, 5))}
        `;
        
        setStatus('Dashboard loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError(`Failed to load dashboard: ${error.message}`);
    }
}

/**
 * Load active patients data
 */
async function loadActivePatients() {
    showLoading();
    
    try {
        // Fetch data from server
        const response = await fetch('/api/read-active?spreadsheetId=local');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('No data received from server');
        }
        
        // Store data globally
        currentData.active = data;
        
        // Create patient table
        const content = document.getElementById('content');
        content.innerHTML = `
            <h1>Active Patients (${data.length})</h1>
            ${generatePatientTable(data)}
        `;
        
        setStatus('Active patients loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading active patients:', error);
        showError(`Failed to load active patients: ${error.message}`);
    }
}

/**
 * Perform search across data
 */
async function performSearch(query) {
    if (!query.trim()) {
        // If search is empty, reload current tab
        switchTab(currentTab, document.querySelector(`[data-tab="${currentTab}"]`));
        return;
    }
    
    showLoading();
    
    try {
        // Search in active patients data
        const data = await GoogleAuth.readSheetData('local', 'Active!A1:ZZ');
        
        // Simple search across patient names and other fields
        const results = data.filter(patient => 
            Object.values(patient).some(value => 
                value && value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <h1>Search Results for "${query}" (${results.length})</h1>
            ${results.length > 0 ? generatePatientTable(results) : '<p>No results found.</p>'}
        `;
        
    } catch (error) {
        console.error('Error performing search:', error);
        showError('Search failed. Check your connection.');
    }
}

/**
 * Pin a patient to the footer with enhanced information
 */
function pinPatient(patientIndex) {
    const patient = currentData.active[patientIndex];
    if (!patient) return;
    
    // Store pinned patient
    localStorage.setItem('pinnedPatient', JSON.stringify(patient));
    
    // Update footer with comprehensive info
    document.getElementById('pinned-name').textContent = patient['Patient Name'] || 'Unknown';
    document.getElementById('pinned-dob').textContent = patient['DOB'] ? formatDate(patient['DOB']) : '-';
    document.getElementById('pinned-age').textContent = patient['Age'] || '-';
    document.getElementById('pinned-phone').textContent = patient['Phone'] || patient['ContactNumber'] || '-';
    document.getElementById('pinned-email').textContent = patient['Email'] || patient['ContactEmail'] || '-';
    document.getElementById('pinned-address').textContent = patient['Address'] || patient['Area'] || '-';
    document.getElementById('pinned-diagnosis').textContent = patient['Diagnosis'] || patient['Condition'] || '-';
    document.getElementById('pinned-hospice').textContent = patient['Hospice'] || '-';
    document.getElementById('pinned-social-worker').textContent = patient['Social Worker'] || patient['SocialWorker'] || '-';
    document.getElementById('pinned-doula').textContent = patient['Doula'] || '-';
    document.getElementById('pinned-caretaker').textContent = patient['Caretaker'] || patient['Care Team'] || '-';
    
    // Show footer
    document.getElementById('pinned-footer').style.display = 'block';
    
    setStatus(`${patient['Patient Name']} pinned with full details`, 'success');
}

/**
 * Create task for patient
 */
function createTaskForPatient(patientIndex) {
    const patient = currentData.active[patientIndex];
    if (!patient) return;
    
    const taskTitle = prompt(`Create task for ${patient['Patient Name']}:`, `Follow up with ${patient['Patient Name']}`);
    if (taskTitle) {
        GoogleAuth.createTaskForPatient(patient, taskTitle)
            .then(() => {
                setStatus(`Task created for ${patient['Patient Name']}`, 'success');
            })
            .catch(err => {
                console.error('Error creating task:', err);
                setStatus('Error creating task', 'error');
            });
    }
}

/**
 * Create calendar event for patient
 */
function createEventForPatient(patientIndex) {
    const patient = currentData.active[patientIndex];
    if (!patient) return;
    
    GoogleAuth.createCalendarEvent(patient, 'follow-up')
        .then(() => {
            setStatus(`Event created for ${patient['Patient Name']}`, 'success');
        })
        .catch(err => {
            console.error('Error creating event:', err);
            setStatus('Error creating event', 'error');
        });
}

/**
 * Load Active Todo workflow tracking
 */
function loadActiveTodo() {
    showLoading();
    
    try {
        const viewMode = localStorage.getItem('todoViewMode') || 'task';
        const toggleHtml = `
            <div class="view-toggle">
                <button onclick="switchTodoView('task')" ${viewMode === 'task' ? 'class="active"' : ''}>Task View</button>
                <button onclick="switchTodoView('patient')" ${viewMode === 'patient' ? 'class="active"' : ''}>Patient View</button>
            </div>
        `;
        
        const content = document.getElementById('content');
        let html = '<h1>Active Patients - Todo Workflow</h1>' + toggleHtml + '<div class="todo-workflow">';
        
        if (viewMode === 'task') {
            html += generateTaskView();
        } else {
            html += generatePatientView();
        }
        
        html += '</div>';
        content.innerHTML = html;
        setStatus('Todo workflow loaded', 'success');
    } catch (error) {
        console.error('Error loading todo:', error);
        showError(`Failed to load todo: ${error.message}`);
    }
}

function switchTodoView(mode) {
    localStorage.setItem('todoViewMode', mode);
    loadActiveTodo();
}

function generateTaskView() {
    // Existing task-based view logic
    return `
        <div class="workflow-section">
            <h3>📋 Workflow Tracking</h3>
            <p>Track completion of tasks for each patient with sign-off initials</p>
            <div class="workflow-grid">
                <div class="workflow-card">
                    <h4>📤 Send Out Written Requests</h4>
                    <div class="workflow-items" id="written-requests">
                        <div class="workflow-item">
                            <span class="patient-name">Adam Jones</span>
                            <div class="workflow-status">
                                <input type="checkbox" id="wr-adam" onchange="updateWorkflowStatus('written-requests', 'adam', this.checked)">
                                <label for="wr-adam">Complete</label>
                                <input type="text" placeholder="Initials" class="initials-input" maxlength="3">
                            </div>
                        </div>
                        <!-- Add more patients dynamically if needed -->
                    </div>
                </div>
                <!-- Add other workflow cards similarly -->
            </div>
        </div>
    `;
}

function generatePatientView() {
    // New patient-based view: Cards per patient with their tasks
    let html = '<div class="patient-workflow-grid">';
    // Assuming currentData.active has patients
    (currentData.active || []).forEach(patient => {
        const name = patient['Patient Name'] || 'Unknown';
        html += `
            <div class="patient-card">
                <h4>${name}</h4>
                <ul class="patient-tasks">
                    <li>Send Written Request <input type="checkbox"> <input type="text" placeholder="Initials" maxlength="3"></li>
                    <li>Visit 1 <input type="checkbox"> <input type="text" placeholder="Initials" maxlength="3"></li>
                    <!-- Add all steps -->
                </ul>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

/**
 * Update workflow status
 */
function updateWorkflowStatus(workflowType, patientKey, completed) {
    const workflowData = JSON.parse(localStorage.getItem('workflowData') || '{}');
    
    if (!workflowData[workflowType]) {
        workflowData[workflowType] = {};
    }
    
    if (!workflowData[workflowType][patientKey]) {
        workflowData[workflowType][patientKey] = {};
    }
    
    workflowData[workflowType][patientKey].completed = completed;
    workflowData[workflowType][patientKey].timestamp = new Date().toISOString();
    
    localStorage.setItem('workflowData', JSON.stringify(workflowData));
    
    setStatus(`${workflowType} updated for ${patientKey}`, 'success');
}

/**
 * Save workflow data
 */
function saveWorkflowData() {
    // Collect all form data
    const workflowData = {};
    
    // Get all workflow items
    document.querySelectorAll('.workflow-item').forEach(item => {
        const patientName = item.querySelector('.patient-name').textContent;
        const checkbox = item.querySelector('input[type="checkbox"]');
        const initialsInput = item.querySelector('.initials-input');
        const dateInput = item.querySelector('.date-input');
        
        const workflowType = item.closest('.workflow-card').querySelector('h4').textContent;
        
        if (!workflowData[workflowType]) {
            workflowData[workflowType] = {};
        }
        
        workflowData[workflowType][patientName] = {
            completed: checkbox.checked,
            initials: initialsInput.value,
            date: dateInput ? dateInput.value : null,
            timestamp: new Date().toISOString()
        };
    });
    
    localStorage.setItem('workflowData', JSON.stringify(workflowData));
    setStatus('Workflow data saved', 'success');
}

/**
 * Load workflow data
 */
function loadWorkflowData() {
    const workflowData = JSON.parse(localStorage.getItem('workflowData') || '{}');
    
    // Apply saved data to form elements
    document.querySelectorAll('.workflow-item').forEach(item => {
        const patientName = item.querySelector('.patient-name').textContent;
        const checkbox = item.querySelector('input[type="checkbox"]');
        const initialsInput = item.querySelector('.initials-input');
        const dateInput = item.querySelector('.date-input');
        
        const workflowType = item.closest('.workflow-card').querySelector('h4').textContent;
        
        if (workflowData[workflowType] && workflowData[workflowType][patientName]) {
            const data = workflowData[workflowType][patientName];
            checkbox.checked = data.completed || false;
            initialsInput.value = data.initials || '';
            if (dateInput && data.date) {
                dateInput.value = data.date;
            }
        }
    });
}

/**
 * Export workflow data to sheet format
 */
function exportWorkflowData() {
    const workflowData = JSON.parse(localStorage.getItem('workflowData') || '{}');
    
    // Convert to CSV-like format for easy copying to sheets
    let csvData = 'Patient Name,Workflow Type,Completed,Initials,Date,Timestamp\n';
    
    Object.keys(workflowData).forEach(workflowType => {
        Object.keys(workflowData[workflowType]).forEach(patientName => {
            const data = workflowData[workflowType][patientName];
            csvData += `${patientName},"${workflowType}",${data.completed},${data.initials || ''},${data.date || ''},${data.timestamp}\n`;
        });
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvData).then(() => {
        setStatus('Workflow data copied to clipboard - paste into new sheet tab', 'success');
    }).catch(() => {
        // Fallback - show in alert
        alert('Copy this data to create a new sheet tab:\n\n' + csvData);
    });
}

/**
 * Utility functions for dashboard metrics (same as simple-app.html)
 */
function calculateAverageAge(data) {
    const ages = data.filter(p => p.Age && !isNaN(p.Age)).map(p => parseInt(p.Age));
    return ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
}

function countPaidInvoices(data) {
    return data.filter(p => p.PAID && p.PAID.toLowerCase() === 'yes').length;
}

function countCompletedCases(data) {
    return data.filter(p => p['Check list'] && p['Check list'].toLowerCase() === 'complete').length;
}

/**
 * UI Helper functions
 */
function showLoading() {
    document.getElementById('content').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

function showError(message) {
    document.getElementById('content').innerHTML = `
        <div style="text-align: center; padding: 50px; color: #e74c3c;">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
    setStatus('Error', 'error');
}

function showPlaceholder(title, description) {
    document.getElementById('content').innerHTML = `
        <div style="text-align: center; padding: 50px; color: #666;">
            <h1>${title}</h1>
            <p>${description}</p>
            <p><em>Coming soon...</em></p>
        </div>
    `;
}

/**
 * Load user-specific tasks and notes page
 */
function loadUserTasks(userName) {
    const content = document.getElementById('content');
    const userKey = userName.toLowerCase().replace(/\s+/g, '-');
    
    content.innerHTML = `
        <h1>${userName}'s Tasks & Notes</h1>
        
        <div class="task-container">
            <div class="task-input-section">
                <h3>➕ Add New Task/Note</h3>
                <div class="task-form">
                    <input type="text" id="task-title-${userKey}" placeholder="Task title..." />
                    <textarea id="task-description-${userKey}" placeholder="Description or notes..."></textarea>
                    <select id="task-priority-${userKey}">
                        <option value="low">Low Priority</option>
                        <option value="medium" selected>Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <input type="url" id="task-link-${userKey}" placeholder="Related link (optional)..." />
                    <div class="task-form-buttons">
                        <button class="btn-primary" onclick="addTask('${userName}')">Add Task</button>
                        <button class="btn-secondary" onclick="clearTaskForm('${userKey}')">Clear</button>
                    </div>
                </div>
            </div>
            
            <div class="task-lists">
                <div class="task-list">
                    <div class="task-list-header pending">
                        📋 Pending Tasks
                    </div>
                    <div id="pending-tasks-${userKey}">
                        <div style="padding: 20px; text-align: center; color: #666;">
                            No pending tasks
                        </div>
                    </div>
                </div>
                
                <div class="task-list">
                    <div class="task-list-header completed">
                        ✅ Completed Tasks
                    </div>
                    <div id="completed-tasks-${userKey}">
                        <div style="padding: 20px; text-align: center; color: #666;">
                            No completed tasks
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load existing tasks
    loadTasksForUser(userName);
}

/**
 * Load all notes overview
 */
function loadAllNotes() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <h1>📋 All Notes & Tasks</h1>
        <div class="notes-container" id="all-notes-container">
            <div style="padding: 50px; text-align: center; color: #666;">
                <p>Loading all notes...</p>
            </div>
        </div>
    `;
    
    // Load all notes from both users
    loadAllNotesData();
}

/**
 * Add a new task
 */
function addTask(userName) {
    const userKey = userName.toLowerCase().replace(/\s+/g, '-');
    const title = document.getElementById(`task-title-${userKey}`).value.trim();
    const description = document.getElementById(`task-description-${userKey}`).value.trim();
    const priority = document.getElementById(`task-priority-${userKey}`).value;
    const link = document.getElementById(`task-link-${userKey}`).value.trim();
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        title: title,
        description: description,
        priority: priority,
        link: link,
        completed: false,
        createdAt: new Date().toISOString(),
        user: userName
    };
    
    // Save to localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Clear form
    clearTaskForm(userKey);
    
    // Reload tasks
    loadTasksForUser(userName);
    
    setStatus(`Task added for ${userName}`, 'success');
}

/**
 * Clear task form
 */
function clearTaskForm(userKey) {
    document.getElementById(`task-title-${userKey}`).value = '';
    document.getElementById(`task-description-${userKey}`).value = '';
    document.getElementById(`task-priority-${userKey}`).value = 'medium';
    document.getElementById(`task-link-${userKey}`).value = '';
}

/**
 * Load tasks for a specific user
 */
function loadTasksForUser(userName) {
    const userKey = userName.toLowerCase().replace(/\s+/g, '-');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const userTasks = tasks.filter(task => task.user === userName);
    
    const pendingTasks = userTasks.filter(task => !task.completed);
    const completedTasks = userTasks.filter(task => task.completed);
    
    // Render pending tasks
    const pendingContainer = document.getElementById(`pending-tasks-${userKey}`);
    if (pendingTasks.length === 0) {
        pendingContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No pending tasks</div>';
    } else {
        pendingContainer.innerHTML = pendingTasks.map(task => renderTaskItem(task)).join('');
    }
    
    // Render completed tasks
    const completedContainer = document.getElementById(`completed-tasks-${userKey}`);
    if (completedTasks.length === 0) {
        completedContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No completed tasks</div>';
    } else {
        completedContainer.innerHTML = completedTasks.map(task => renderTaskItem(task)).join('');
    }
}

/**
 * Render a single task item
 */
function renderTaskItem(task) {
    const date = new Date(task.createdAt).toLocaleDateString();
    const linkHtml = task.link ? `<a href="${task.link}" target="_blank" class="note-link">🔗 Link</a>` : '';
    
    return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                <span>${date}</span>
            </div>
            ${linkHtml ? `<div class="note-links">${linkHtml}</div>` : ''}
            <div class="task-actions">
                ${!task.completed ? `<button class="task-action-btn btn-complete" onclick="toggleTask('${task.id}')">✓ Complete</button>` : 
                  `<button class="task-action-btn btn-complete" onclick="toggleTask('${task.id}')">↩ Reopen</button>`}
                <button class="task-action-btn btn-edit" onclick="editTask('${task.id}')">✏ Edit</button>
                <button class="task-action-btn btn-delete" onclick="deleteTask('${task.id}')">🗑 Delete</button>
            </div>
        </div>
    `;
}

/**
 * Toggle task completion status
 */
function toggleTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].completedAt = tasks[taskIndex].completed ? new Date().toISOString() : null;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reload current user's tasks
        const currentUser = tasks[taskIndex].user;
        loadTasksForUser(currentUser);
        
        setStatus(`Task ${tasks[taskIndex].completed ? 'completed' : 'reopened'}`, 'success');
    }
}

/**
 * Delete a task
 */
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const currentUser = tasks[taskIndex].user;
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reload current user's tasks
        loadTasksForUser(currentUser);
        
        setStatus('Task deleted', 'success');
    }
}

/**
 * Edit a task (simplified - just prompt for new title)
 */
function editTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const newTitle = prompt('Edit task title:', tasks[taskIndex].title);
        if (newTitle && newTitle.trim()) {
            tasks[taskIndex].title = newTitle.trim();
            tasks[taskIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Reload current user's tasks
            loadTasksForUser(tasks[taskIndex].user);
            
            setStatus('Task updated', 'success');
        }
    }
}

/**
 * Load all notes data for overview
 */
function loadAllNotesData() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const container = document.getElementById('all-notes-container');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div style="padding: 50px; text-align: center; color: #666;"><p>No notes or tasks yet</p></div>';
        return;
    }
    
    // Sort by creation date (newest first)
    const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = sortedTasks.map(task => `
        <div class="note-item">
            <div class="note-header">
                <div class="note-title">${task.title} (${task.user})</div>
                <div class="note-date">${new Date(task.createdAt).toLocaleDateString()}</div>
            </div>
            ${task.description ? `<div class="note-content">${task.description}</div>` : ''}
            <div class="note-links">
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                ${task.completed ? '<span style="color: #27ae60;">✅ COMPLETED</span>' : '<span style="color: #e67e22;">⏳ PENDING</span>'}
                ${task.link ? `<a href="${task.link}" target="_blank" class="note-link">🔗 Link</a>` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Load calendar events
 */
async function loadCalendar() {
    try {
        const content = document.getElementById('calendar-events');
        content.innerHTML = 'Loading events...';

        // Assuming listEvents is defined in sync.js or auth.js
        const events = await listEvents(); // Use the existing listEvents function

        content.innerHTML = '';
        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <span class="event-summary">${event.summary}</span>
                <span class="event-date">${new Date(event.start.dateTime).toLocaleString()}</span>
            `;
            content.appendChild(eventItem);
        });
    } catch (error) {
        console.error('Error loading calendar:', error);
        content.innerHTML = 'Error loading events.';
    }
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (date instanceof Date) {
        return date.toLocaleDateString();
    }
    return date;
}

// Make initMainApp available globally
window.initMainApp = initMainApp; 

async function loadTodos() {
    try {
        const content = document.getElementById('todo-list');
        content.innerHTML = 'Loading tasks...';

        // Assuming listTasks is defined in sync.js or auth.js
        const tasks = await listTasks();

        content.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <span class="task-title">${task.title}</span>
                <span class="task-due">Due: ${task.due ? new Date(task.due).toLocaleDateString() : 'No due date'}</span>
                <span class="task-status" onclick="completeTask('${task.id}')">${task.status === 'completed' ? '✅' : '⬜'}</span>
            `;
            content.appendChild(taskItem);
        });
    } catch (error) {
        console.error('Error loading todos:', error);
        content.innerHTML = 'Error loading tasks.';
    }
}

async function createNewTask() {
    const title = prompt('Enter task title:');
    if (title) {
        // Assuming createTask is defined
        await createTask(title, new Date()); // Default due date today
        loadTodos(); // Refresh list
    }
}

async function completeTask(taskId) {
    // Assuming a function to mark task as completed
    await updateTaskStatus(taskId, 'completed');
    loadTodos(); // Refresh
} 

/**
 * Load pinned patient from localStorage
 */
function loadPinnedPatient() {
    const pinnedPatient = JSON.parse(localStorage.getItem('pinnedPatient') || '{}');
    if (pinnedPatient['Patient Name']) {
        // Update footer with pinned patient info
        document.getElementById('pinned-name').textContent = pinnedPatient['Patient Name'] || 'Unknown';
        document.getElementById('pinned-dob').textContent = pinnedPatient['DOB'] ? formatDate(pinnedPatient['DOB']) : '-';
        document.getElementById('pinned-age').textContent = pinnedPatient['Age'] || '-';
        document.getElementById('pinned-phone').textContent = pinnedPatient['Phone'] || pinnedPatient['ContactNumber'] || '-';
        document.getElementById('pinned-email').textContent = pinnedPatient['Email'] || pinnedPatient['ContactEmail'] || '-';
        document.getElementById('pinned-address').textContent = pinnedPatient['Address'] || pinnedPatient['Area'] || '-';
        document.getElementById('pinned-diagnosis').textContent = pinnedPatient['Diagnosis'] || pinnedPatient['Condition'] || '-';
        document.getElementById('pinned-hospice').textContent = pinnedPatient['Hospice'] || '-';
        document.getElementById('pinned-social-worker').textContent = pinnedPatient['Social Worker'] || pinnedPatient['SocialWorker'] || '-';
        document.getElementById('pinned-doula').textContent = pinnedPatient['Doula'] || '-';
        document.getElementById('pinned-caretaker').textContent = pinnedPatient['Caretaker'] || pinnedPatient['Care Team'] || '-';
        
        // Show footer
        document.getElementById('pinned-footer').style.display = 'block';
    } else {
        // Hide footer if no patient pinned
        document.getElementById('pinned-footer').style.display = 'none';
    }
} 

/**
 * List events (mock implementation for local mode)
 */
async function listEvents() {
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.calendar) {
        // Google Calendar API implementation
        const request = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return request.result.items || [];
    } else {
        // Local mode - return mock events from localStorage
        const events = JSON.parse(localStorage.getItem('calendar-events') || '[]');
        return events.map(event => ({
            ...event,
            start: { dateTime: event.start },
            summary: event.summary
        }));
    }
}

/**
 * List tasks (mock implementation for local mode)
 */
async function listTasks() {
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.tasks) {
        // Google Tasks API implementation
        const request = await gapi.client.tasks.tasks.list({ tasklist: '@default' });
        return request.result.items || [];
    } else {
        // Local mode - return mock tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('google-tasks') || '[]');
        return tasks.map(task => ({
            ...task,
            status: task.completed ? 'completed' : 'needsAction'
        }));
    }
}

/**
 * Create task (mock implementation for local mode)
 */
async function createTask(title, dueDate) {
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.tasks) {
        // Google Tasks API implementation
        const task = { title, due: dueDate.toISOString() };
        await gapi.client.tasks.tasks.insert({ tasklist: '@default', resource: task });
    } else {
        // Local mode - store in localStorage
        const tasks = JSON.parse(localStorage.getItem('google-tasks') || '[]');
        const task = {
            id: Date.now().toString(),
            title: title,
            due: dueDate.toISOString(),
            created: new Date().toISOString(),
            completed: false
        };
        tasks.push(task);
        localStorage.setItem('google-tasks', JSON.stringify(tasks));
    }
}

/**
 * Update task status (mock implementation for local mode)
 */
async function updateTaskStatus(taskId, status) {
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.tasks) {
        // Google Tasks API implementation
        await gapi.client.tasks.tasks.patch({
            tasklist: '@default',
            task: taskId,
            resource: { status }
        });
    } else {
        // Local mode - update in localStorage
        const tasks = JSON.parse(localStorage.getItem('google-tasks') || '[]');
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = (status === 'completed');
            localStorage.setItem('google-tasks', JSON.stringify(tasks));
        }
    }
} 

// New function for loading patient timelines
async function loadPatientTimelines() {
    showLoading();
    
    try {
        const response = await fetch('/api/read-active?spreadsheetId=local');
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No data received');
        }
        
        const content = document.getElementById('content');
        let html = '<h1>Patient Timelines</h1>' +
            '<div class="legend">' +
            '  <span class="legend-item red">Red = Action Required</span>' +
            '  <span class="legend-item yellow">Yellow = Waiting on Response</span>' +
            '  <span class="legend-item green">Green = Complete</span>' +
            '  <p>Black outline indicates current progress step</p>' +
            '</div>' +
            '<div class="timelines-container">';
        data.forEach((patient, index) => {
            const patientName = patient['Patient Name'] || 'Unknown';
            const progressPoint = Math.floor(Math.random() * 5) + 6; // Biased to 6-10 for mostly complete
            const numPending = Math.floor(Math.random() * 2) + 1; // 1-2 pending
            html += `
                <div class="patient-timeline" data-current-step="${progressPoint}">
                    <h3>${patientName}</h3>
                    <div class="timeline">
                        ${generateTimelineSteps(patient, index, progressPoint, numPending)}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        content.innerHTML = html;
        setStatus('Timelines loaded', 'success');
    } catch (error) {
        console.error('Error loading timelines:', error);
        showError(`Failed to load timelines: ${error.message}`);
    }
}

// Helper to generate timeline steps
function generateTimelineSteps(patient, index, progressPoint, numPending) {
    const steps = [
        { name: 'Send Written Request', key: 'WR' },
        { name: 'Visit 1', key: 'Visit1' },
        { name: 'Visit 2', key: 'Visit2' },
        { name: 'Quickbooks Invoice', key: 'invoice amount' },
        { name: 'Consulting Form', key: 'CP Completed' },
        { name: 'Attending Checklist', key: 'Check list' },
        { name: 'Send Prescription', key: 'Prescription Submit', subtasks: ['Review Info', 'Submit to RX', 'Confirm Delivery'] },
        { name: 'Request Medical Records', key: 'Medical Records' },
        { name: 'Prepare Pharmacy Email', key: 'EmailPharmacy' },
        { name: 'Ingestions', key: 'Ingestion Date' },
        { name: 'Follow-up Form', key: 'Physician follow up form' }
    ];
    
    const patientName = patient['Patient Name'];
    
    let html = '';
    steps.forEach((step, i) => {
        let statusClass;
        if (patientName === 'Clare Burd' || patientName === 'Grace Evans') {
            if (i === 0 || i === 1) { // Steps 1 and 2 (0-indexed)
                statusClass = 'complete';
            } else {
                // Normal logic for others
                if (i < progressPoint) {
                    statusClass = Math.random() < 0.2 ? 'waiting' : 'complete';
                } else if (i === progressPoint) {
                    statusClass = 'waiting';
                } else {
                    statusClass = (i - progressPoint <= numPending) ? 'pending' : 'pending';
                }
            }
        } else {
            if (i < progressPoint) {
                statusClass = Math.random() < 0.2 ? 'waiting' : 'complete';
            } else if (i === progressPoint) {
                statusClass = 'waiting';
            } else {
                statusClass = (i - progressPoint <= numPending) ? 'pending' : 'pending';
            }
        }
        const isCurrent = i === progressPoint ? 'current' : '';
        const checkbox = `<input type="checkbox" ${statusClass === 'complete' || statusClass === 'waiting' ? 'checked' : ''} onchange="updateStepStatus(${index}, ${i}, this.checked)">`;
        const subtasksHtml = step.subtasks ? `<div class="subtasks" style="display: none;"><ul>${step.subtasks.map((sub, j) => `<li>${sub} <input type="checkbox" onchange="updateSubtask(${index}, ${i}, ${j}, this.checked)"></li>`).join('')}</ul></div>` : '';
        html += `
            <div class="timeline-step ${statusClass} ${isCurrent}" onclick="toggleStepDetails(${index}, ${i})">
                <div class="bullet ${step.subtasks ? 'has-subtasks' : ''}">${i+1}</div>
                <span>${step.name}</span>
                ${checkbox}
                ${subtasksHtml}
            </div>
        `;
    });
    return html;
}

// Toggle subtasks or details
function toggleStepDetails(patientIndex, stepIndex) {
    const stepElement = document.querySelectorAll('.timeline')[patientIndex].querySelectorAll('.timeline-step')[stepIndex];
    const subtasks = stepElement.querySelector('.subtasks');
    if (subtasks) {
        subtasks.style.display = subtasks.style.display === 'none' ? 'block' : 'none';
    } else {
        const patientName = currentData.active[patientIndex]['Patient Name'];
        const stepName = steps[stepIndex].name; // Assume steps array is accessible or define it
        showModal(`Details for ${patientName} - ${stepName}`, patientIndex, stepIndex);
    }
}

// Simple modal function
function showModal(message, patientIndex, stepIndex) {
    const fakeNotes = [
        'Follow up on patient consent form.',
        'Waiting for medical records from hospice.',
        'Invoice sent - awaiting payment confirmation.',
        'Prescription details verified.',
        'Visit scheduled for next week.'
    ];
    const fakeAttachments = [
        'consent_form.pdf',
        'medical_records.zip',
        'invoice_123.png',
        'rx_details.doc'
    ];
    
    // Randomize for variety
    const randomNote = fakeNotes[Math.floor(Math.random() * fakeNotes.length)];
    const randomAttachment = Math.random() < 0.5 ? fakeAttachments[Math.floor(Math.random() * fakeAttachments.length)] : null;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    let content = `
        <div class=\"modal-content\">
            <span class=\"close\" onclick=\"this.parentElement.parentElement.remove()\">&times;</span>
            <h3>${message}</h3>
            <p><strong>Note:</strong> ${randomNote}</p>
    `;
    if (randomAttachment) {
        content += `<p><strong>Attachment:</strong> <a href=\"#\" class=\"fake-link\">${randomAttachment}</a></p>`;
    }
    content += '</div>';
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

// Placeholder update functions
function updateStepStatus(patientIndex, stepIndex, checked) {
    console.log(`Updated step ${stepIndex + 1} for patient ${patientIndex} to ${checked ? 'complete' : 'pending'}`);
    // TODO: Save to data
}

function updateSubtask(patientIndex, stepIndex, subIndex, checked) {
    console.log(`Updated subtask ${subIndex + 1} for step ${stepIndex + 1}, patient ${patientIndex}`);
    // TODO: Save to data
} 

// Add dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

// Initialize dark mode on load
window.addEventListener('load', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

/**
 * Load call log data
 */
function loadCallLog() {
    showPlaceholder('Call Log', 'Call log functionality coming soon...');
}

/**
 * Load chat data and display in UI
 */
async function loadChat(currentUser = null) {
    try {
        showLoading();
        
        // Fetch chat data from the API
        const url = currentUser 
            ? `/api/read-chat?spreadsheetId=local&user=${encodeURIComponent(currentUser)}`
            : '/api/read-chat?spreadsheetId=local';
            
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch chat data');
        }
        
        const messages = await response.json();
        displayChat(messages, currentUser);
        
    } catch (error) {
        console.error('Error loading chat:', error);
        showError('Failed to load chat messages');
    }
}

/**
 * Display chat messages in the UI
 */
function displayChat(messages, currentUser = null) {
    const content = document.getElementById('content');
    
    const chatHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2>💬 Team Chat${currentUser ? ` - ${currentUser}'s View` : ''}</h2>
                <p>Real-time team communication with DM/Group messages and @mentions</p>
                <div class="chat-stats">
                    <span class="stat">${messages.length} messages</span>
                    <span class="stat">${new Set(messages.map(m => m.Sender)).size} team members</span>
                    <span class="stat">${currentUser ? 'Filtered View' : 'All Messages'}</span>
                </div>
            </div>
            
            <div class="chat-messages" id="chat-messages">
                ${messages.map(message => createChatMessageHTML(message)).join('')}
            </div>
            
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <select id="chat-user-select" class="chat-user-select">
                        <option value="Alyssa">Alyssa</option>
                        <option value="Dr. Moore">Dr. Moore</option>
                        <option value="Christa">Christa</option>
                        <option value="Amber">Amber</option>
                    </select>
                    <select id="chat-type-select" class="chat-type-select">
                        <option value="GM">Group Message (GM)</option>
                        <option value="DM">Direct Message (DM)</option>
                        <option value="NOTE">Personal Note (NOTE)</option>
                    </select>
                    <input type="text" id="chat-recipients-input" placeholder="Recipients: @Alyssa @Dr. Moore @Christa @Amber" class="chat-recipients-input">
                    <input type="text" id="chat-message-input" placeholder="Type your message..." class="chat-message-input">
                    <button onclick="sendChatMessage()" class="chat-send-btn">Send</button>
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = chatHTML;
    
    // Scroll to bottom of chat
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Create HTML for a single chat message
 */
function createChatMessageHTML(message) {
    const timestamp = formatChatTimestamp(message.Timestamp);
    const messageType = getMessageTypeLabel(message.Type);
    const participants = parseParticipants(message.Participants);
    const isMention = message.Message.includes('@');
    const mentionClass = isMention ? 'mention' : '';
    const typeClass = message.Type?.toLowerCase() || 'gm';
    
    return `
        <div class="chat-message ${mentionClass} message-type-${typeClass}">
            <div class="chat-message-header">
                <span class="chat-user">${message.Sender}</span>
                <span class="chat-timestamp">${timestamp}</span>
                <span class="chat-type ${typeClass}">${messageType}</span>
            </div>
            <div class="chat-participants">${participants}</div>
            <div class="chat-message-content">
                ${formatChatMessage(message.Message)}
            </div>
            ${message.Tags ? `<div class="chat-tags"><span class="tag">${message.Tags}</span></div>` : ''}
        </div>
    `;
}

/**
 * Format chat timestamp
 */
function formatChatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    // Convert YYYYMMDDHHMMSS to readable format
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);
    
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toLocaleString();
}

/**
 * Get message type label
 */
function getMessageTypeLabel(type) {
    const labels = {
        'GM': '👥 Group',
        'DM': '💬 Direct',
        'NOTE': '📝 Note'
    };
    return labels[type] || '💬 Message';
}

/**
 * Parse participants string to readable format
 */
function parseParticipants(participants) {
    if (!participants) return '';
    
    // Extract names from <Name> format
    const names = participants.match(/<([^>]+)>/g) || [];
    const cleanNames = names.map(name => name.replace(/[<>]/g, ''));
    
    if (cleanNames.length === 0) return '';
    if (cleanNames.length === 1) return `To: ${cleanNames[0]}`;
    if (cleanNames.length <= 3) return `To: ${cleanNames.join(', ')}`;
    return `To: ${cleanNames[0]}, ${cleanNames[1]} +${cleanNames.length - 2} others`;
}

/**
 * Get message type icon (legacy support)
 */
function getMessageTypeIcon(type) {
    const icons = {
        'message': '💬',
        'question': '❓',
        'update': '📋',
        'task': '📝',
        'good_news': '🎉',
        'info': 'ℹ️',
        'GM': '👥',
        'DM': '💬',
        'NOTE': '📝'
    };
    return icons[type] || '💬';
}

/**
 * Format chat message with @mentions
 */
function formatChatMessage(message) {
    return message.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

/**
 * Send a new chat message
 */
async function sendChatMessage() {
    const userSelect = document.getElementById('chat-user-select');
    const messageInput = document.getElementById('chat-message-input');
    const typeSelect = document.getElementById('chat-type-select');
    
    const user = userSelect.value;
    const message = messageInput.value.trim();
    const type = typeSelect.value;
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    try {
        const response = await fetch('/api/add-chat-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user,
                message,
                type,
                recipients: 'all'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        // Clear input and reload chat
        messageInput.value = '';
        await loadChat();
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

/**
 * Load vendors data and display in UI
 */
async function loadVendors() {
    try {
        showLoading();
        
        // Fetch vendors data from the API
        const response = await fetch('/api/read-vendors?spreadsheetId=local');
        if (!response.ok) {
            throw new Error('Failed to fetch vendors data');
        }
        
        const vendors = await response.json();
        
        if (vendors.length === 0) {
            showPlaceholder('Vendors', 'No vendors found. Add some service partners to get started.');
            return;
        }
        
        // Group vendors by category
        const vendorsByCategory = {};
        vendors.forEach(vendor => {
            const category = vendor['Category'] || 'Other';
            if (!vendorsByCategory[category]) {
                vendorsByCategory[category] = [];
            }
            vendorsByCategory[category].push(vendor);
        });
        
        // Generate HTML for vendors display
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="vendors-container">
                <div class="vendors-header">
                    <h2>🏢 Vendors & Service Partners</h2>
                    <p>Manage your hospice service providers and partners</p>
                    <div class="vendor-stats">
                        <span class="stat">📊 ${vendors.length} Total Vendors</span>
                        <span class="stat">🏷️ ${Object.keys(vendorsByCategory).length} Categories</span>
                    </div>
                </div>
                
                <div class="vendors-grid">
                    ${Object.entries(vendorsByCategory).map(([category, categoryVendors]) => `
                        <div class="vendor-category">
                            <h3>${getCategoryIcon(category)} ${category}</h3>
                            <div class="vendor-cards">
                                ${categoryVendors.map(vendor => generateVendorCard(vendor)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading vendors:', error);
        showError('Failed to load vendors data: ' + error.message);
    }
}

/**
 * Generate vendor card HTML
 */
function generateVendorCard(vendor) {
    const rating = vendor['Rating'] || 'N/A';
    const status = vendor['Status'] || 'Active';
    const lastContact = vendor['Last Contact'] || 'N/A';
    
    return `
        <div class="vendor-card ${status.toLowerCase()}">
            <div class="vendor-header">
                <h4>${vendor['Company Name'] || 'Unknown Company'}</h4>
                <span class="vendor-id">${vendor['Vendor ID'] || ''}</span>
            </div>
            
            <div class="vendor-details">
                <p class="service-type">${vendor['Service Type'] || 'General Services'}</p>
                <p class="contact-person">👤 ${vendor['Contact Person'] || 'No contact listed'}</p>
                <p class="phone">📞 ${vendor['Phone'] || 'No phone listed'}</p>
                <p class="email">📧 ${vendor['Email'] || 'No email listed'}</p>
                <p class="address">📍 ${vendor['Address'] || 'No address listed'}</p>
            </div>
            
            <div class="vendor-meta">
                <div class="rating">
                    <span class="rating-label">Rating:</span>
                    <span class="rating-value">${rating}</span>
                </div>
                <div class="status">
                    <span class="status-badge ${status.toLowerCase()}">${status}</span>
                </div>
                <div class="last-contact">
                    <span class="last-contact-label">Last Contact:</span>
                    <span class="last-contact-value">${lastContact}</span>
                </div>
            </div>
            
            <div class="vendor-notes">
                <p>${vendor['Notes'] || 'No notes available'}</p>
            </div>
            
            <div class="vendor-actions">
                <button class="vendor-action-btn" onclick="contactVendor('${vendor['Vendor ID']}')" title="Contact vendor">
                    📞 Contact
                </button>
                <button class="vendor-action-btn" onclick="viewVendorDetails('${vendor['Vendor ID']}')" title="View details">
                    👁️ Details
                </button>
                <button class="vendor-action-btn" onclick="editVendor('${vendor['Vendor ID']}')" title="Edit vendor">
                    ✏️ Edit
                </button>
            </div>
        </div>
    `;
}

/**
 * Get category icon based on vendor category
 */
function getCategoryIcon(category) {
    const icons = {
        'Cremation': '🔥',
        'Pharmacy': '💊',
        'Doula': '🤱',
        'Funeral Services': '⚰️',
        'Medical Equipment': '🩺',
        'Counseling': '🧠',
        'Other': '🏢'
    };
    return icons[category] || '🏢';
}

/**
 * Contact vendor function
 */
function contactVendor(vendorId) {
    // Find vendor data and open contact options
    console.log('Contacting vendor:', vendorId);
    // TODO: Implement contact functionality
    alert('Contact functionality coming soon for vendor: ' + vendorId);
}

/**
 * View vendor details function
 */
function viewVendorDetails(vendorId) {
    console.log('Viewing details for vendor:', vendorId);
    // TODO: Implement detailed view
    alert('Detailed view coming soon for vendor: ' + vendorId);
}

/**
 * Edit vendor function
 */
function editVendor(vendorId) {
    console.log('Editing vendor:', vendorId);
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon for vendor: ' + vendorId);
} 