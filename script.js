class FinanceManager {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.form = document.getElementById('transaction-form');
        this.transactionList = document.getElementById('transaction-list');
        this.exportButton = document.getElementById('export-data');

        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        this.exportButton.addEventListener('click', () => {
            this.exportData();
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;

        if (!description || isNaN(amount) || amount <= 0) {
            alert('Please provide a valid description and a positive amount.');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            date: new Date().toLocaleDateString()
        };

        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.form.reset();
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(transaction => transaction.id !== id);
            this.saveToLocalStorage();
            this.updateDisplay();
        }
    }

    calculateTotals() {
        return this.transactions.reduce((totals, transaction) => {
            if (transaction.type === 'income') {
                totals.income += transaction.amount;
            } else {
                totals.expenses += transaction.amount;
            }
            totals.balance = totals.income - totals.expenses;
            return totals;
        }, { income: 0, expenses: 0, balance: 0 });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    updateDisplay() {
        const totals = this.calculateTotals();

        document.getElementById('total-balance').textContent = this.formatCurrency(totals.balance);
        document.getElementById('total-income').textContent = this.formatCurrency(totals.income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(totals.expenses);

        this.transactionList.innerHTML = this.transactions
            .sort((a, b) => b.id - a.id)
            .map(transaction => `
                <div class="transaction-item">
                    <div>
                        <strong>${transaction.description}</strong>
                        <p>${transaction.date}</p>
                    </div>
                    <div>
                        <span class="${transaction.type}-text">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </span>
                        <button class="delete-btn" onclick="financeManager.deleteTransaction(${transaction.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    exportData() {
        const blob = new Blob([JSON.stringify(this.transactions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.json';
        a.click();
    }
}

const financeManager = new FinanceManager();
