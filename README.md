# Deployment Instructions
1. Save the files as index.html, styles.css, and script.js in the same folder.

2. Update the API URL in script.js:

+ Find the line: const API_BASE_URL = 'https://inventory-api.onrender.com/api';

+ Replace with your actual backend URL ("https://inventory-api-uis8.onrender.com/api")

3. Deploy the frontend:

+ You can deploy to services like Netlify, Vercel, or GitHub Pages

+ For Netlify: Drag and drop the folder containing the three files

+ For GitHub Pages: Push to a repository and enable GitHub Pages in settings

4. Test the application:

+ Navigate to your deployed frontend URL

+ The app should connect to your backend API

+ You should be able to perform all CRUD operations

# API Endpoints Used
Based on your backend code, the frontend uses these endpoints:

## Products
+ GET /api/products - Get all products

+ GET /api/products/:id - Get a specific product

+ POST /api/products - Create a new product

+ PUT /api/products/:id - Update a product

+ DELETE /api/products/:id - Delete a product

## Suppliers
+ GET /api/suppliers - Get all suppliers

+ GET /api/suppliers/:id - Get a specific supplier

+ POST /api/suppliers - Create a new supplier

+ PUT /api/suppliers/:id - Update a supplier

+ DELETE /api/suppliers/:id - Delete a supplier

## Orders
+ GET /api/orders - Get all orders

+ GET /api/orders/:id - Get a specific order

+ POST /api/orders - Create a new order

+ PUT /api/orders/:id - Update an order

+ DELETE /api/orders/:id - Delete an order

## Features Implemented
1. Responsive Design - Works on mobile, tablet, and desktop

2. Five UI Sections - Dashboard, Products, Suppliers, Orders, Create New

3. Full CRUD Operations - Create, Read, Update, Delete for all entities

4. Real-time API Interaction - All operations communicate with your backend

5. User-friendly Interface - Clean, modern design with intuitive navigation

6. Form Validation - Client-side validation for all forms

7. Status Indicators - Visual feedback for API connection status

   
