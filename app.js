// --- NAVIGAZIONE E LOGIN ---
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if(user && pass) { // Simulazione login base
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        initCharts(); // Inizializza i grafici quando entri nella dashboard
    } else {
        alert("Inserisci utente e password");
    }
}

function logout() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
}

function switchTab(tabId) {
    // Rimuovi active da tutti
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    // Aggiungi active a quello selezionato
    document.getElementById(tabId).classList.add('active');
    document.getElementById('nav-' + tabId).classList.add('active');
}

// --- POMODORO TIMER BASE ---
let timerInterval;
let isRunning = false;

function startTimer() {
    if(isRunning) return;
    isRunning = true;
    
    let minsInput = document.getElementById('pomo-mins');
    let secsSpan = document.getElementById('pomo-secs');
    
    let totalSeconds = parseInt(minsInput.value) * 60 + parseInt(secsSpan.innerText);
    minsInput.disabled = true; // Blocca la modifica manuale durante il play

    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            minsInput.disabled = false;
            alert("Tempo scaduto! Ottimo lavoro.");
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

// --- GESTIONE FINANZIARIA ---
let balance = 0;
let transactions = [];
let pieChartInstance = null;

function updateBalanceDisplay() {
    document.getElementById('current-balance').innerText = `€ ${balance.toFixed(2)}`;
}

function editBalance() {
    let newBalance = prompt("Inserisci il nuovo saldo disponibile:", balance);
    if(newBalance !== null && !isNaN(newBalance)) {
        balance = parseFloat(newBalance);
        updateBalanceDisplay();
    }
}

function addTransaction() {
    const date = document.getElementById('trans-date').value;
    const type = document.getElementById('trans-type').value;
    const category = document.getElementById('trans-category').value || "Generico";
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const desc = document.getElementById('trans-desc').value;

    if(!date || isNaN(amount)) {
        alert("Inserisci data e importo validi!");
        return;
    }

    // Aggiorna saldo
    if(type === 'in') { balance += amount; } 
    else { balance -= amount; }
    
    updateBalanceDisplay();

    // Crea oggetto transazione
    const tr = { date, type, category, amount, desc };
    transactions.push(tr);

    // Aggiorna UI della tabella
    const tbody = document.querySelector('#transactions-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${date}</td>
        <td class="${type === 'in' ? 'text-success' : 'text-danger'}">${type === 'in' ? 'Entrata' : 'Uscita'}</td>
        <td>${category}</td>
        <td>${desc}</td>
        <td class="${type === 'in' ? 'text-success' : 'text-danger'}">${type === 'in' ? '+' : '-'} €${amount.toFixed(2)}</td>
    `;
    tbody.prepend(row); // Aggiunge all'inizio della lista
    
    // Svuota i campi
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-desc').value = '';

    // Aggiorna Grafici (Logica da espandere con i dati reali)
    // Per ora ridisegniamo il grafico d'esempio
    initCharts(); 
}

// --- GRAFICI (Chart.js) ---
function initCharts() {
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    
    // Distruggi il grafico vecchio se esiste per aggiornarlo
    if(pieChartInstance) pieChartInstance.destroy();

    // Dati fittizi per l'esempio (andrebbero calcolati dall'array 'transactions')
    pieChartInstance = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Cibo', 'Trasporti', 'Svago', 'Affitto/Bollette'],
            datasets: [{
                data: [30, 15, 20, 35], // Percentuali
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']
            }]
        }
    });

    // Grafico a Barre (Entrate vs Uscite) - Inizializzato una volta
    if(!window.barChartInstance) {
        const ctxBar = document.getElementById('barChart').getContext('2d');
        window.barChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'], // Mesi
                datasets: [
                    { label: 'Entrate', data: [1200, 1500, 1100, 1300, 1600, 1400], backgroundColor: '#10B981' },
                    { label: 'Uscite', data: [900, 1000, 850, 1100, 950, 1050], backgroundColor: '#EF4444' }
                ]
            }
        });
    }
}
