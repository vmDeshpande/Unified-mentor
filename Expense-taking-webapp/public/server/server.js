// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// Middleware setup
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs"); // Set EJS as the template engine

// Helper function to read/write transactions from/to a JSON file
const FILE_PATH = path.join(__dirname, "transactions.json");

// Read transactions from JSON file
const readTransactions = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return []; // Return empty array if file doesn't exist or cannot be read
  }
};

// Write transactions to JSON file
const writeTransactions = (transactions) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(transactions, null, 2), "utf-8");
};

// Render the index.html page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Get all transactions
app.get("/api/transactions", (req, res) => {
  const transactions = readTransactions();
  res.json(transactions); // Send all transactions as JSON response
});

// Add a new transaction
app.post("/api/transactions", (req, res) => {
  const { text, amount, category } = req.body;

  if (!text || !amount) {
    return res.status(400).json({ error: "Please provide text and amount." });
  }

  const transactions = readTransactions();
  const newTransaction = {
    id: uuidv4(), // Generate a unique ID for the transaction
    text,
    amount: parseFloat(amount),
    category
  };

  transactions.push(newTransaction); // Add the new transaction to the list
  writeTransactions(transactions); // Save updated transactions to the file

  res.status(201).json(newTransaction); // Respond with the created transaction
});

// Remove a transaction by ID
app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  let transactions = readTransactions();

  const transactionExists = transactions.some((t) => t.id === id);
  if (!transactionExists) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  transactions = transactions.filter((transaction) => transaction.id !== id); // Remove the transaction
  writeTransactions(transactions); // Save updated transactions to the file

  res.status(200).json({ message: "Transaction deleted." }); // Respond with success message
});

// Get balance, income, and expense
app.get("/api/balance", (req, res) => {
  const transactions = readTransactions();
  const amounts = transactions.map((transaction) => transaction.amount);

  const income = amounts.filter((item) => item > 0)
                        .reduce((acc, item) => acc + item, 0)
                        .toFixed(2);
  const expense = (amounts.filter((item) => item < 0)
                          .reduce((acc, item) => acc + item, 0) * -1)
                          .toFixed(2);

  const netIncome = (income - expense).toFixed(2); // Calculate remaining balance

  res.json({ totalIncome: income, totalExpenses: expense, netIncome });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
