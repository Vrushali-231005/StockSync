# StockSync

A MERN-based Inventory & Employee Management System with real-time request handling.

## Project Structure
- **backend/** – Express.js server, MongoDB models, controllers, routes
- **frontend/** – React app (Vite), Tailwind CSS, Lucide icons

## Features
- Employee management
- Inventory management with CRUD
- Inventory request handling (new/exchange)
- Real-time status updates
- Image uploads for inventory items
- Pagination for inventory list

## Getting Started

1. Clone the repo:

```bash
git clone https://github.com/Vrushali-231005/StockSync.git

2.setup backend
cd StockSync/backend
npm install
npm run dev

3.setup frontend
cd StockSync/frontend
npm install
npm run dev

Description

StockSync is a full-stack MERN application designed to simplify inventory and employee management in organizations. With this system, administrators can efficiently manage employees, track inventory items, and handle real-time inventory requests. The app supports both new and exchange requests, allowing employees to request new items or replace defective ones seamlessly.

The backend, built with Node.js and Express, connects to MongoDB for robust data management. Inventory items include details such as name, description, category, total quantity, available quantity, and images. Administrators can perform CRUD operations on inventory and monitor all requests in real-time. The frontend leverages React with Vite, Tailwind CSS, and Lucide icons for a fast, responsive, and visually appealing interface.

StockSync ensures smooth workflow with features like pagination for large inventory lists, image uploads for easier identification of items, and automated handling of employee-inventory assignments. It is ideal for small to medium-sized organizations aiming to digitize their inventory management processes while maintaining simplicity and efficiency.