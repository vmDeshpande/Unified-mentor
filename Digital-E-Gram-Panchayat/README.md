
# Digital E Gram Panchayat

A web-based platform designed to streamline government services for citizens. This project focuses on bridging the gap between citizens and their local governing bodies by providing a user-friendly interface for accessing services, submitting applications, and managing records.

## Key Features

- **Role-based login system**:
  - **Admin Login**: For managing staff and monitoring the platform.
  - **Staff Login**: To create and manage services, and handle citizen applications.
  - **Citizen Login**: For applying to services, checking application status, and accessing benefits.

- **Secure Access**: Role-specific login ensures proper access and data security for all users.

- **Citizen Features**:
  - Register/login and explore government services.
  - Apply for services and check application status.

- **Staff Features**:
  - Manage available services and review citizen applications.

- **Action Logging**: Ensures transparency and accountability in operations.

## Tech Highlights

- **Frontend**: 
  - **HTML**, **JavaScript**, and **Tailwind CSS** for a sleek and **responsive UI**.

- **Backend**:
  - **Node.js** with **Express.js** for robust server-side functionality.

- **Database**:
  - **MongoDB** for dynamic data management.

- **Image Integration**:
  - Integrated **Pexels API** to dynamically fetch high-quality images, enhancing the platform's visual appeal.

## Project Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **MongoDB**: [Set up MongoDB](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas for cloud hosting)
- **Pexels API Key**: [Sign up for an API key](https://www.pexels.com/api/)

### Installation

1. Clone the folder:
 ```
 Download This Folder
 ```
2. Navigate to the project folder:
```
cd digital-e-gram-panchayat
```
3. Install dependencies:
```
npm install
```
4. Keys:
```
Change the Pexels API Key in "carousel.js" & MongoDB String in "server.js"
```
5. Start the server:
```
node .
```
The platform should now be accessible at `http://localhost:3000` in your browser.

## Contributing
Feel free to fork the repository and submit pull requests for improvements or bug fixes!