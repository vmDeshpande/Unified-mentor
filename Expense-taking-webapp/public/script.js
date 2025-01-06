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

if (list) {
    fetch("/api/transactions") // Use /api/transactions
        .then((response) => response.json())
        .then((transactions) => {
            list.innerHTML = ""; // Clear current list
            transactions.forEach((transaction) => {
                const sign = transaction.amount < 0 ? "-" : "+";
                const item = document.createElement("li");

                item.classList.add(
                    "flex",
                    "justify-between",
                    "items-center",
                    "p-4",
                    "border-b",
                    transaction.amount < 0 ? "bg-red-200" : "bg-green-200",
                    "rounded-md"
                );


                item.innerHTML = `
          <span class="font-semibold text-gray-800 truncate w-1/3">${transaction.text}</span>
<span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(transaction.amount)}</span>
<span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-700 transition-all duration-300">${transaction.category}</span>
<button class="ml-4 text-red-600 hover:text-red-800 transition-colors duration-300 rounded-full p-1 hover:bg-red-50 focus:outline-none" onclick="deleteTransaction('${transaction.id}')">
  <i class="fas fa-trash-alt text-lg"></i>
</button>
        `;

                list.appendChild(item);
            });

            updateBalance();
            loadTransactions();
        })
        .catch((error) => console.error("Error fetching transactions:", error));
}

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (text.value.trim() === "" || amount.value.trim() === "") {
            alert("Please add text and amount");
            return;
        }

        const transactionTypeValue = transactionType.value;
        const amountValue = parseFloat(amount.value);
        const categoryValue = category.value;
        let amountFinal = amountValue;

        // Adjust the amount based on selected transaction type
        if (transactionTypeValue === "expense") {
            amountFinal = -Math.abs(amountValue); // Make sure expense is negative
        } else {
            amountFinal = Math.abs(amountValue); // Ensure income is positive
        }

        const newTransaction = {
            text: text.value.charAt(0).toUpperCase() + text.value.slice(1).toLowerCase(),
            amount: amountFinal,
            category: categoryValue, // Add category to the new transaction object
        };

        fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction),
        })
            .then((response) => response.json())
            .then((savedTransaction) => {
                const sign = savedTransaction.amount < 0 ? "-" : "+";
                const item = document.createElement("li");

                item.classList.add(
                    "flex",
                    "justify-between",
                    "items-center",
                    "p-4",
                    "border-b",
                    savedTransaction.amount < 0 ? "bg-red-200" : "bg-green-200",
                    "rounded-md"
                );

                item.innerHTML = `
<span class="font-semibold text-gray-800 truncate w-1/3">${savedTransaction.text}</span>
<span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(savedTransaction.amount)}</span>
<span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-700 transition-all duration-300">${savedTransaction.category}</span>
<button class="ml-4 text-red-600 hover:text-red-800 transition-colors duration-300 rounded-full p-1 hover:bg-red-50 focus:outline-none" onclick="deleteTransaction('${savedTransaction.id}')">
  <i class="fas fa-trash-alt text-lg"></i>
</button>
        `;

                list.appendChild(item);
                updateBalance();
                loadTransactions();

                text.value = "";
                amount.value = "";
                transactionType.value = "income"; // Reset dropdown to 'income'
                category.value = "Food"; // Reset category dropdown
            })
            .catch((error) => console.error("Error adding transaction:", error));
    });
}

function deleteTransaction(id) {
    fetch(`/api/transactions/${id}`, {
        method: "DELETE",
    })
        .then(() => {
            fetch("/api/transactions")
                .then((response) => response.json())
                .then((transactions) => {
                    list.innerHTML = "";
                    transactions.forEach((transaction) => {
                        const sign = transaction.amount < 0 ? "-" : "+";
                        const item = document.createElement("li");

                        item.classList.add(
                            "flex",
                            "justify-between",
                            "items-center",
                            "p-4",
                            "border-b",
                            transaction.amount < 0 ? "bg-red-200" : "bg-green-200",
                            "rounded-md"
                        );

                        item.innerHTML = `
<span class="font-semibold text-gray-800 truncate w-1/3">${transaction.text}</span>
<span class="text-xl font-medium text-gray-900">${sign} &#8377;${Math.abs(transaction.amount)}</span>
<span class="text-sm bg-gray-800 text-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-700 transition-all duration-300">${transaction.category}</span>
<button class="ml-4 text-red-600 hover:text-red-800 transition-colors duration-300 rounded-full p-1 hover:bg-red-50 focus:outline-none" onclick="deleteTransaction('${transaction.id}')">
  <i class="fas fa-trash-alt text-lg"></i>
</button>
            `;

                        list.appendChild(item);
                    });

                    updateBalance();
                    loadTransactions();
                });
        })
        .catch((error) => console.error("Error deleting transaction:", error));
}

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



const tableBody = document.getElementById('transaction-table')
function loadTransactions() {
    // Fetch the transactions data from the JSON file
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            // Clear any existing rows
            tableBody.innerHTML = '';

            // Loop through the transactions and create table rows
            transactions.forEach(transaction => {
                const row = document.createElement('tr');

                // Create the table cells for the transaction data
                const textCell = document.createElement('td');
                textCell.textContent = transaction.text;

                const amountCell = document.createElement('td');
                amountCell.textContent = `₹${Math.abs(transaction.amount).toFixed(2)}`;
                amountCell.classList.add(transaction.amount < 0 ? 'text-red-400' : 'text-green-400');

                const categoryCell = document.createElement('td');
                categoryCell.textContent = transaction.category;

                const dateCell = document.createElement('td');
                dateCell.textContent = new Date().toLocaleDateString(); // Using current date for now, replace with actual date if available in JSON

                const actionCell = document.createElement('td');
                actionCell.classList.add('text-center');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.classList.add('text-red-600', 'hover:text-red-800', 'focus:outline-none');
                deleteButton.onclick = function () {
                    deleteTransaction(transaction.id);
                };
                actionCell.appendChild(deleteButton);

                // Append the cells to the row
                row.appendChild(textCell);
                row.appendChild(amountCell);
                row.appendChild(categoryCell);
                row.appendChild(dateCell);
                row.appendChild(actionCell);

                // Append the row to the table body
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading transaction data:', error);
        });
}

if (tableBody) {
    loadTransactions();  // Load the initial transactions when the page loads
}