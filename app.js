// --- NAVIGAZIONE E LOGIN (Inalterati logicamente) ---
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if(user && pass) {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        // Piccolo timeout per permettere al CSS di caricare prima di disegnare i grafici
        setTimeout(initCharts, 100); 
    } else {
        alert("Inserisci utente e password (qualsiasi vanno bene per ora)");
    }
}

function logout() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    // Resettiamo i campi login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById('nav-' + tabId).classList.add('active');
}

// --- POMODORO TIMER BASE (Inalterato) ---
let timerInterval;
let isRunning = false;

function startTimer() {
    if(isRunning) return;
    isRunning = true;
    
    let minsInput = document.getElementById('pomo-mins');
    let secsSpan = document.getElementById('pomo-secs');
    
    let totalSeconds = parseInt(minsInput.value) * 60 + parseInt(secsSpan.innerText);
    minsInput.disabled = true;

    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            minsInput.disabled = false;
            alert("Tempo scaduto! Fai una pausa.");
            resetTimer();
            return;
        }
        totalSeconds--;
        minsInput.value = Math.floor(totalSeconds / 60);
        let s = totalSeconds % 60;
        secsSpan.innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('pomo-mins').disabled = false;
}

function resetTimer() {
    pauseTimer();
    document.getElementById('pomo-mins').value = 25;
    document.getElementById('pomo-secs').innerText = "00";
}

// Task temporanei per estetica
function addTask() {
    let taskInput = document.getElementById('new-task');
    if(taskInput.value) {
        let ul = document.getElementById('tasks');
        let li = document.createElement('li');
        li.innerHTML = `<span>${taskInput.value}</span> <i class="fa-solid fa-check text-success"></i>`;
        ul.appendChild(li);
        taskInput.value = '';
    }
}

// --- GESTIONE FINANZIARIA (Logica base) ---
let balance = 0;
let transactions = [];
let pieChartInstance = null;
let barChartInstance = null;

function updateBalanceDisplay() {
    document.getElementById('current-balance').innerText = `€ ${balance.toFixed(2)}`;
}

function editBalance() {
    let newBalance = prompt("Modifica Saldo Manualmente:", balance);
    if(newBalance !== null && !isNaN(newBalance) && newBalance !== "") {
        balance = parseFloat(newBalance);
        updateBalanceDisplay();
    }
}

function addTransaction() {
    const date = document.getElementById('trans-date').value;
    const type = document.getElementById('trans-type').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const category = document.getElementById('trans-category').value || "Varie";
    const desc = document.getElementById('trans-desc').value || "-";

    if(!date || isNaN(amount) || amount <= 0) {
        alert("Inserisci almeno data e importo valido!");
        return;
    }

    // Aggiorna saldo
    if(type === 'in') { balance += amount; } 
    else { balance -= amount; }
    
    updateBalanceDisplay();

    // Registra transazione
    transactions.push({ date, type, category, amount, desc });

    // Aggiorna Tabella (UI)
    const tbody = document.querySelector('#transactions-table tbody');
    const row = document.createElement('tr');
    
    // Formattazione data italiana semplice (aaaa-mm-gg -> gg/mm)
    const dateObj = new Date(date);
    const formattedDate = dateObj.getDate() + '/' + (dateObj.getMonth()+1);

    row.innerHTML = `
        <td>${formattedDate}</td>
        <td><span class="badg-cat">${category}</span></td>
        <td>${desc}</td>
        <td class="text-right ${type === 'in' ? 'text-success' : 'text-danger'}">
            ${type === 'in' ? '+' : '-'} €${amount.toFixed(2)}
        </td>
    `;
    tbody.prepend(row); // Aggiunge in alto
    
    // Reset Campi Form
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-desc').value = '';
    document.getElementById('trans-category').value = '';

    // Qui andrebbe ricalcolata la logica dei grafici basata sull'array 'transactions'
    // Per ora aggiorniamo solo visivamente
}

// --- GRAFICI Configurazione Estetica (Chart.js) ---
// Font globale per Chart.js coerente con il CSS
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#6b7280"; // text-sub

function initCharts() {
    // 1. Grafico a Torta (Spese)
    const ctxPie = document.getElementById('pieChart');
    if(ctxPie) {
        if(pieChartInstance) pieChartInstance.destroy();
        
        // Dati d'esempio Teal-based
        pieChartInstance = new Chart(ctxPie, {
            type: 'doughnut', // Più moderno della torta piena
            data: {
                labels: ['Casa', 'Cibo', 'Svago', 'Auto'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#0d9488', '#2dd4bf', '#99f6e4', '#e5e7eb'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } }
                },
                cutout: '70%' // Buco centrale per Doughnut
            }
        });
    }

    // 2. Grafico a Barre (Trend)
    const ctxBar = document.getElementById('barChart');
    if(ctxBar) {
        if(barChartInstance) barChartInstance.destroy();

        barChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set'],
                datasets: [
                    { label: 'Entrate', data: [1500, 1600, 1400, 1800, 1200, 2000], backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Uscite', data: [1100, 950, 1050, 1300, 1400, 1200], backgroundColor: '#ef4444', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } }
                }
            }
        });
    }
}
