// Fetch DOM elements
const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const transactionType = document.getElementById("transaction-type");
const category = document.getElementById("category");
const tableBody = document.getElementById('transaction-table');

// Fetch and display transactions
if (list) {
    fetch("/api/transactions") // Fetch transaction data from API
        .then((response) => response.json())
        .then((transactions) => {
            list.innerHTML = ""; // Clear current list
            transactions.forEach((transaction) => {
                const sign = transaction.amount < 0 ? "-" : "+"; // Determine sign for transaction
                const item = document.createElement("li");

                // Create list item and apply styling based on amount
                item.classList.add(
                    "flex", "justify-between", "items-center", "p-4", "border-b",
                    transaction.amount < 0 ? "bg-red-200" : "bg-green-200", "rounded-md"
                );

                // Append transaction details to item
                item.innerHTML = `
                    <span class="font-semibold text-gray-800 truncate w-1/3">${transaction.text}</span>
                    <span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(transaction.amount)}</span>
                    <span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg">${transaction.category}</span>
                    <button class="ml-4 text-red-600 hover:text-red-800" onclick="deleteTransaction('${transaction.id}')">
                        <i class="fas fa-trash-alt text-lg"></i>
                    </button>
                `;
                list.appendChild(item);
            });
            updateBalance(); // Update balance display
        })
        .catch((error) => console.error("Error fetching transactions:", error));
}

// Handle form submission to add new transaction
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validate form fields
        if (text.value.trim() === "" || amount.value.trim() === "") {
            alert("Please add text and amount");
            return;
        }

        // Prepare new transaction data
        const transactionTypeValue = transactionType.value;
        let amountValue = parseFloat(amount.value);
        if (transactionTypeValue === "expense") {
            amountValue = -Math.abs(amountValue); // Ensure expense is negative
        } else {
            amountValue = Math.abs(amountValue); // Ensure income is positive
        }

        const newTransaction = {
            text: text.value.charAt(0).toUpperCase() + text.value.slice(1).toLowerCase(), // Capitalize first letter of text
            amount: amountValue,
            category: category.value
        };

        // Add transaction to API
        fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction),
        })
            .then((response) => response.json())
            .then((savedTransaction) => {
                // Create new list item for saved transaction
                const sign = savedTransaction.amount < 0 ? "-" : "+";
                const item = document.createElement("li");

                item.classList.add(
                    "flex", "justify-between", "items-center", "p-4", "border-b",
                    savedTransaction.amount < 0 ? "bg-red-200" : "bg-green-200", "rounded-md"
                );

                // Append transaction details to new item
                item.innerHTML = `
                    <span class="font-semibold text-gray-800 truncate w-1/3">${savedTransaction.text}</span>
                    <span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(savedTransaction.amount)}</span>
                    <span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg">${savedTransaction.category}</span>
                    <button class="ml-4 text-red-600 hover:text-red-800" onclick="deleteTransaction('${savedTransaction.id}')">
                        <i class="fas fa-trash-alt text-lg"></i>
                    </button>
                `;
                list.appendChild(item);
                updateBalance(); // Update balance after adding new transaction
                loadTransactions(); // Reload transaction table
                text.value = ""; // Reset text input
                amount.value = ""; // Reset amount input
                transactionType.value = "income"; // Reset transaction type to 'income'
                category.value = "Food"; // Reset category dropdown
            })
            .catch((error) => console.error("Error adding transaction:", error));
    });
}

// Delete transaction function
function deleteTransaction(id) {
    fetch(`/api/transactions/${id}`, {
        method: "DELETE",
    })
        .then(() => {
            fetch("/api/transactions")
                .then((response) => response.json())
                .then((transactions) => {
                    list.innerHTML = ""; // Clear list
                    transactions.forEach((transaction) => {
                        const sign = transaction.amount < 0 ? "-" : "+"; // Determine sign for transaction
                        const item = document.createElement("li");

                        item.classList.add(
                            "flex", "justify-between", "items-center", "p-4", "border-b",
                            transaction.amount < 0 ? "bg-red-200" : "bg-green-200", "rounded-md"
                        );

                        item.innerHTML = `
                            <span class="font-semibold text-gray-800 truncate w-1/3">${transaction.text}</span>
                            <span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(transaction.amount)}</span>
                            <span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg">${transaction.category}</span>
                            <button class="ml-4 text-red-600 hover:text-red-800" onclick="deleteTransaction('${transaction.id}')">
                                <i class="fas fa-trash-alt text-lg"></i>
                            </button>
                        `;
                        list.appendChild(item);
                    });
                    updateBalance(); // Update balance after deleting transaction
                    loadTransactions(); // Reload transaction table
                });
        })
        .catch((error) => console.error("Error deleting transaction:", error));
}

// Update balance section with total income, expenses, and net balance
function updateBalance() {
    fetch("/api/balance")
        .then((response) => response.json())
        .then(({ totalIncome, totalExpenses, netIncome }) => {
            balance.innerHTML = `&#8377;${netIncome}`;
            moneyPlus.innerHTML = `+&#8377;${totalIncome}`;
            moneyMinus.innerHTML = `-&#8377;${totalExpenses}`;
        })
        .catch((error) => console.error("Error fetching balance:", error));
}

// Load transactions into the table
function loadTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            tableBody.innerHTML = ''; // Clear existing rows
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
                const textCell = document.createElement('td');
                textCell.textContent = transaction.text;

                const amountCell = document.createElement('td');
                amountCell.textContent = `₹${Math.abs(transaction.amount).toFixed(2)}`;
                amountCell.classList.add(transaction.amount < 0 ? 'text-red-400' : 'text-green-400');

                const categoryCell = document.createElement('td');
                categoryCell.textContent = transaction.category;

                const dateCell = document.createElement('td');
                dateCell.textContent = new Date().toLocaleDateString(); // Using current date

                const actionCell = document.createElement('td');
                actionCell.classList.add('text-center');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.classList.add('text-red-600', 'hover:text-red-800');
                deleteButton.onclick = () => deleteTransaction(transaction.id); // Delete button functionality
                actionCell.appendChild(deleteButton);

                row.appendChild(textCell);
                row.appendChild(amountCell);
                row.appendChild(categoryCell);
                row.appendChild(dateCell);
                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading transaction data:', error));
}

// Load transactions on page load
if (tableBody) {
    loadTransactions();
}
