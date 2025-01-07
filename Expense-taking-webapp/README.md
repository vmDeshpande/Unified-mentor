# Expense Tracker

An easy-to-use Expense Tracker built with HTML, Tailwind CSS, and vanilla JavaScript, designed to help users track their income and expenses while calculating their net income in real-time.

## Features

- Add income and expense transactions.
- View total income and expenses.
- See a real-time summary of net income.
- Organize transactions by category.
- Table Structure for history of transactions.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (LTS version recommended)  
  [Install Node.js](https://nodejs.org/)
- **NPM** (Node Package Manager)  
  NPM is included with Node.js, so you don't need to install it separately.

## Installation

To set up the Expense Tracker locally on your machine, follow these steps:

**1. Download this Folder**:

**2. Navigate into the project folder**:

    ```bash
    cd expense-tracker
    ```

**3. Install dependencies**:

    Install all necessary dependencies by running:

    ```bash
    npm install
    ```

**4. Run the application**:

    After the installation is complete, start the application:

    ```bash
    node .
    ```

    This will start the server, and you can open the application in your browser by visiting `http://localhost:3000`.

## Usage

Once the server is running, you can access the application in your browser. You will be able to interact with the following features:

### Home Page (Expense Tracker)

- **Total Income**: Displays the total income from all income transactions.
- **Total Expense**: Displays the total expenses from all expense transactions.
- **Net Income**: Displays the difference between total income and total expenses.
- **Transaction History**: A list of all transactions with descriptions and amounts.
- **Add New Transaction**: You can add new transactions by filling out the form with:
  - **Transaction Text**: A brief description of the transaction (e.g., "Salary", "Groceries").
  - **Amount**: The amount of money for the transaction. Positive amounts for income, and negative amounts for expenses.
  - **Transaction Type**: Choose between **Income** or **Expense**.
  - **Category**: Choose the category for the transaction (e.g., Food, Transportation, Bills, etc.).

Transactions will automatically appear in the "Transaction History" section, and the total amounts and net income will update in real-time.

## Author

- [Vedant Deshpande](https://github.com/vmDeshpande)
