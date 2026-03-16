document.addEventListener("DOMContentLoaded", function () {
    let budget = 0;
    let totalExpenses = 0;
    let selectedCurrency = "PLN";
    let expenses = [];
    let editingExpenseIndex = -1;

    const budgetInput = document.getElementById("budgetInput");
    const setBudgetBtn = document.getElementById("setBudgetBtn");
    const currencySelect = document.getElementById("currencySelect");

    const expenseName = document.getElementById("expenseName");
    const expenseCategory = document.getElementById("expenseCategory");
    const expenseAmount = document.getElementById("expenseAmount");
    const expenseDate = document.getElementById("expenseDate");
    const addExpenseBtn = document.getElementById("addExpenseBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    const budgetAmount = document.getElementById("budgetAmount");
    const totalExpensesText = document.getElementById("totalExpenses");
    const remainingAmount = document.getElementById("remainingAmount");
    const expenseList = document.getElementById("expenseList");

    const currencyLabel = document.getElementById("currencyLabel");
    const currencyLabel2 = document.getElementById("currencyLabel2");
    const currencyLabel3 = document.getElementById("currencyLabel3");

    const historyMonth = document.getElementById("historyMonth");
    const showHistoryBtn = document.getElementById("showHistoryBtn");
    const historyResult = document.getElementById("historyResult");

    function saveData() {
        const appData = {
            budget: budget,
            selectedCurrency: selectedCurrency,
            expenses: expenses
        };

        localStorage.setItem("unibudgetData", JSON.stringify(appData));
    }

    function loadData() {
        const savedData = localStorage.getItem("unibudgetData");

        if (!savedData) {
            return;
        }

        const parsedData = JSON.parse(savedData);

        budget = parsedData.budget || 0;
        selectedCurrency = parsedData.selectedCurrency || "PLN";
        expenses = parsedData.expenses || [];

        calculateTotalExpenses();
    }

    function calculateTotalExpenses() {
        totalExpenses = 0;

        for (let i = 0; i < expenses.length; i++) {
            totalExpenses += Number(expenses[i].amount);
        }
    }

    function updateCurrencyLabels() {
        currencyLabel.textContent = selectedCurrency;
        currencyLabel2.textContent = selectedCurrency;
        currencyLabel3.textContent = selectedCurrency;
    }

    function updateSummary() {
        budgetAmount.textContent = budget;
        totalExpensesText.textContent = totalExpenses;
        remainingAmount.textContent = budget - totalExpenses;
    }

    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    function getCurrentMonth() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");

        return year + "-" + month;
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "No date";
        }

        const parts = dateString.split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function formatMonthLabel(monthString) {
        if (!monthString || !monthString.includes("-")) {
            return monthString;
        }

        const parts = monthString.split("-");
        const year = parts[0];
        const month = parts[1];

        return month + "/" + year;
    }

    function resetExpenseInputs() {
        expenseName.value = "";
        expenseCategory.value = "";
        expenseAmount.value = "";
        expenseDate.value = getTodayDate();
        editingExpenseIndex = -1;
        addExpenseBtn.textContent = "Add Expense";
    }

    function renderMonthlyHistory() {
        const selectedMonth = historyMonth.value;

        if (selectedMonth === "") {
            historyResult.innerHTML = "<div class=\"history-item\">Please select a month.</div>";
            return;
        }

        let monthlyTotal = 0;
        const categoryTotals = {};
        let monthlyCount = 0;

        for (let i = 0; i < expenses.length; i++) {
            if (!expenses[i].date) {
                continue;
            }

            const expenseMonth = expenses[i].date.slice(0, 7);

            if (expenseMonth === selectedMonth) {
                monthlyCount++;
                monthlyTotal += Number(expenses[i].amount);

                if (!categoryTotals[expenses[i].category]) {
                    categoryTotals[expenses[i].category] = 0;
                }

                categoryTotals[expenses[i].category] += Number(expenses[i].amount);
            }
        }

        if (monthlyCount === 0) {
            historyResult.innerHTML =
                "<div class=\"history-item\">You did not enter any expenses for " +
                formatMonthLabel(selectedMonth) +
                ".</div>";
            return;
        }

        let html = "";
        html += "<div class=\"history-item\"><strong>Month:</strong> " + formatMonthLabel(selectedMonth) + "</div>";
        html += "<div class=\"history-item\"><strong>Total spent:</strong> " + monthlyTotal + " " + selectedCurrency + "</div>";
        html += "<div class=\"history-item\"><strong>Expense count:</strong> " + monthlyCount + "</div>";

        const categories = Object.keys(categoryTotals);

        for (let i = 0; i < categories.length; i++) {
            html +=
                "<div class=\"history-item\"><strong>" +
                categories[i] +
                ":</strong> " +
                categoryTotals[categories[i]] +
                " " +
                selectedCurrency +
                "</div>";
        }

        historyResult.innerHTML = html;
    }

    function deleteExpense(index) {
        expenses.splice(index, 1);

        if (editingExpenseIndex === index) {
            resetExpenseInputs();
        } else if (editingExpenseIndex > index) {
            editingExpenseIndex--;
        }

        calculateTotalExpenses();
        renderExpenses();
        updateSummary();
        saveData();
        renderMonthlyHistory();
    }

    function editExpense(index) {
        const expense = expenses[index];

        expenseName.value = expense.name;
        expenseCategory.value = expense.category;
        expenseAmount.value = expense.amount;
        expenseDate.value = expense.date;
        currencySelect.value = expense.currency;
        selectedCurrency = expense.currency;

        editingExpenseIndex = index;
        addExpenseBtn.textContent = "Update Expense";

        updateCurrencyLabels();
    }

    function renderExpenses() {
        expenseList.innerHTML = "";

        for (let i = 0; i < expenses.length; i++) {
            const li = document.createElement("li");

            const expenseText = document.createElement("span");
            expenseText.textContent =
                expenses[i].name +
                " | " +
                expenses[i].category +
                " | " +
                expenses[i].amount +
                " " +
                expenses[i].currency +
                " | " +
                formatDate(expenses[i].date);

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.style.marginTop = "10px";
            editBtn.style.marginRight = "10px";
            editBtn.addEventListener("click", function () {
                editExpense(i);
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.marginTop = "10px";
            deleteBtn.addEventListener("click", function () {
                deleteExpense(i);
            });

            li.appendChild(expenseText);
            li.appendChild(document.createElement("br"));
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);

            expenseList.appendChild(li);
        }
    }

    expenseCategory.addEventListener("change", function () {
        if (expenseName.value.trim() === "") {
            expenseName.value = expenseCategory.value;
        }
    });

    currencySelect.addEventListener("change", function () {
        selectedCurrency = currencySelect.value;
        updateCurrencyLabels();
        saveData();
        renderMonthlyHistory();
    });

    showHistoryBtn.addEventListener("click", function () {
        renderMonthlyHistory();
    });

    cancelEditBtn.addEventListener("click", function () {
        resetExpenseInputs();
    });

    setBudgetBtn.addEventListener("click", function () {
        const value = Number(budgetInput.value);

        if (Number.isNaN(value) || value < 0) {
            alert("Please enter a valid budget.");
            return;
        }

        budget = value;
        updateSummary();
        saveData();
    });

    addExpenseBtn.addEventListener("click", function () {
        const name = expenseName.value.trim() || expenseCategory.value;
        const category = expenseCategory.value;
        const amount = Number(expenseAmount.value);
        const date = expenseDate.value;

        if (name === "" || category === "" || Number.isNaN(amount) || amount <= 0 || date === "") {
            alert("Please enter a valid expense.");
            return;
        }

        const expense = {
            name: name,
            category: category,
            amount: amount,
            currency: selectedCurrency,
            date: date
        };

        if (editingExpenseIndex === -1) {
            expenses.push(expense);
        } else {
            expenses[editingExpenseIndex] = expense;
        }

        calculateTotalExpenses();
        renderExpenses();
        updateSummary();
        saveData();
        resetExpenseInputs();
        renderMonthlyHistory();
    });

    loadData();
    currencySelect.value = selectedCurrency;
    updateCurrencyLabels();
    updateSummary();
    renderExpenses();
    historyMonth.value = getCurrentMonth();
    renderMonthlyHistory();
    expenseDate.value = getTodayDate();
});