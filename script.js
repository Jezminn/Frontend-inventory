// Configuration
const API_BASE_URL = 'https://inventory-api-uis8.onrender.com/api'; // Replace with your actual backend URL
let currentModalData = null;
let currentModalType = null;

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const formTypeButtons = document.querySelectorAll('.form-type-btn');
const createForms = document.querySelectorAll('.create-form');
const modal = document.getElementById('modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalBody = document.getElementById('modal-body');
const apiStatusIndicator = document.getElementById('api-status-indicator');
const apiStatusText = document.getElementById('api-status-text');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Check API connection
    checkApiConnection();
    
    // Load initial data for dashboard
    loadDashboardData();
    
    // Load data for each section
    loadProducts();
    loadSuppliers();
    loadOrders();
    
    // Populate dropdowns for order form
    populateSupplierDropdown();
    populateProductDropdown();
});

// Event Listeners Setup
function setupEventListeners() {
    // Navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            switchSection(sectionId);
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Form type buttons (Product/Supplier/Order)
    formTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const formType = button.getAttribute('data-form');
            switchForm(formType);
            formTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Refresh buttons
    document.getElementById('refresh-products').addEventListener('click', loadProducts);
    document.getElementById('refresh-suppliers').addEventListener('click', loadSuppliers);
    document.getElementById('refresh-orders').addEventListener('click', loadOrders);
    
    // Form submissions
    document.getElementById('product-form').addEventListener('submit', createProduct);
    document.getElementById('supplier-form').addEventListener('submit', createSupplier);
    document.getElementById('order-form').addEventListener('submit', createOrder);
    
    // Add item button for order form
    document.getElementById('add-item-btn').addEventListener('click', addOrderItem);
    
    // Modal close button
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Switch between sections
function switchSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Switch between forms in create section
function switchForm(formType) {
    createForms.forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${formType}-form`).classList.add('active');
}

// Check API connection
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            apiStatusIndicator.classList.add('connected');
            apiStatusText.textContent = 'Connected to API';
        } else {
            apiStatusIndicator.classList.add('error');
            apiStatusText.textContent = 'API Error';
        }
    } catch (error) {
        apiStatusIndicator.classList.add('error');
        apiStatusText.textContent = 'Cannot connect to API';
        console.error('API connection error:', error);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load products count
        const productsResponse = await fetch(`${API_BASE_URL}/products`);
        const products = await productsResponse.json();
        document.getElementById('total-products').textContent = products.length;
        
        // Load suppliers count
        const suppliersResponse = await fetch(`${API_BASE_URL}/suppliers`);
        const suppliers = await suppliersResponse.json();
        document.getElementById('total-suppliers').textContent = suppliers.length;
        
        // Load orders count
        const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
        const orders = await ordersResponse.json();
        document.getElementById('total-orders').textContent = orders.length;
        
        // Count pending orders
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        document.getElementById('pending-orders').textContent = pendingOrders;
        
        // Display recent products
        const recentProducts = products.slice(0, 5);
        const recentProductsHTML = recentProducts.map(product => `
            <div class="data-item">
                <strong>${product.sku}</strong>: ${product.name} - $${product.price} (Stock: ${product.stock})
            </div>
        `).join('');
        document.getElementById('recent-products').innerHTML = recentProductsHTML;
        
        // Display recent orders
        const recentOrders = orders.slice(0, 5);
        const recentOrdersHTML = recentOrders.map(order => `
            <div class="data-item">
                <strong>Order</strong>: ${order.supplierId?.name || 'Unknown Supplier'} - ${order.status}
            </div>
        `).join('');
        document.getElementById('recent-orders').innerHTML = recentOrdersHTML;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load and display products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const productsBody = document.getElementById('products-body');
        if (products.length === 0) {
            productsBody.innerHTML = '<tr><td colspan="5">No products found</td></tr>';
            return;
        }
        
        const productsHTML = products.map(product => `
            <tr>
                <td>${product.sku}</td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.stock}</td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" onclick="openEditModal('product', '${product._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItem('product', '${product._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        productsBody.innerHTML = productsHTML;
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-body').innerHTML = '<tr><td colspan="5">Error loading products</td></tr>';
    }
}

// Load and display suppliers
async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        const suppliers = await response.json();
        
        const suppliersBody = document.getElementById('suppliers-body');
        if (suppliers.length === 0) {
            suppliersBody.innerHTML = '<tr><td colspan="3">No suppliers found</td></tr>';
            return;
        }
        
        const suppliersHTML = suppliers.map(supplier => `
            <tr>
                <td>${supplier.name}</td>
                <td>${supplier.contact}</td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" onclick="openEditModal('supplier', '${supplier._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItem('supplier', '${supplier._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        suppliersBody.innerHTML = suppliersHTML;
    } catch (error) {
        console.error('Error loading suppliers:', error);
        document.getElementById('suppliers-body').innerHTML = '<tr><td colspan="3">Error loading suppliers</td></tr>';
    }
}

// Load and display orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const orders = await response.json();
        
        const ordersBody = document.getElementById('orders-body');
        if (orders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="4">No orders found</td></tr>';
            return;
        }
        
        const ordersHTML = orders.map(order => `
            <tr>
                <td>${order.supplierId?.name || 'Unknown Supplier'}</td>
                <td>${order.items?.length || 0} items</td>
                <td>
                    <span class="status-badge ${order.status}">
                        ${order.status}
                    </span>
                </td>
                <td class="action-btns">
                    <button class="action-btn view-btn" onclick="viewOrderDetails('${order._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit-btn" onclick="openEditModal('order', '${order._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItem('order', '${order._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        ordersBody.innerHTML = ordersHTML;
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-body').innerHTML = '<tr><td colspan="4">Error loading orders</td></tr>';
    }
}

// Create a new product
async function createProduct(e) {
    e.preventDefault();
    
    const productData = {
        sku: document.getElementById('product-sku').value,
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product created successfully!');
            document.getElementById('product-form').reset();
            loadProducts();
            loadDashboardData();
            populateProductDropdown();
        } else {
            alert('Error creating product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Error creating product');
    }
}

// Create a new supplier
async function createSupplier(e) {
    e.preventDefault();
    
    const supplierData = {
        name: document.getElementById('supplier-name').value,
        contact: document.getElementById('supplier-contact').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });
        
        if (response.ok) {
            alert('Supplier created successfully!');
            document.getElementById('supplier-form').reset();
            loadSuppliers();
            loadDashboardData();
            populateSupplierDropdown();
        } else {
            alert('Error creating supplier');
        }
    } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Error creating supplier');
    }
}

// Create a new order
async function createOrder(e) {
    e.preventDefault();
    
    const orderItems = [];
    const itemElements = document.querySelectorAll('.order-item');
    
    itemElements.forEach(item => {
        const productSelect = item.querySelector('.order-product');
        const qtyInput = item.querySelector('.order-qty');
        
        if (productSelect.value && qtyInput.value) {
            orderItems.push({
                productId: productSelect.value,
                qty: parseInt(qtyInput.value),
                price: parseFloat(productSelect.selectedOptions[0].getAttribute('data-price'))
            });
        }
    });
    
    if (orderItems.length === 0) {
        alert('Please add at least one item to the order');
        return;
    }
    
    const orderData = {
        supplierId: document.getElementById('order-supplier').value,
        status: document.getElementById('order-status').value,
        items: orderItems
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            alert('Order created successfully!');
            document.getElementById('order-form').reset();
            // Reset to first item only
            const itemsContainer = document.getElementById('order-items-container');
            itemsContainer.innerHTML = `
                <div class="order-item">
                    <div class="form-group">
                        <label>Product</label>
                        <select class="order-product">
                            <option value="">Select a product</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" class="order-qty" value="1" min="1">
                    </div>
                    <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            populateProductDropdown();
            attachRemoveItemListeners();
            loadOrders();
            loadDashboardData();
        } else {
            alert('Error creating order');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Error creating order');
    }
}

// Add item to order form
function addOrderItem() {
    const itemsContainer = document.getElementById('order-items-container');
    const newItem = document.createElement('div');
    newItem.className = 'order-item';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Product</label>
            <select class="order-product">
                <option value="">Select a product</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" class="order-qty" value="1" min="1">
        </div>
        <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i></button>
    `;
    itemsContainer.appendChild(newItem);
    
    // Populate the new dropdown
    populateProductDropdown();
    
    // Attach event listener to the new remove button
    newItem.querySelector('.remove-item-btn').addEventListener('click', function() {
        itemsContainer.removeChild(newItem);
    });
}

// Populate supplier dropdown
async function populateSupplierDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        const suppliers = await response.json();
        
        const supplierSelect = document.getElementById('order-supplier');
        supplierSelect.innerHTML = '<option value="">Select a supplier</option>';
        
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier._id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading suppliers for dropdown:', error);
    }
}

// Populate product dropdown
async function populateProductDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const productSelects = document.querySelectorAll('.order-product');
        productSelects.forEach(select => {
            // Store current value
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select a product</option>';
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product._id;
                option.textContent = `${product.sku} - ${product.name} ($${product.price})`;
                option.setAttribute('data-price', product.price);
                select.appendChild(option);
            });
            
            // Restore previous value if it exists
            if (currentValue) {
                select.value = currentValue;
            }
        });
    } catch (error) {
        console.error('Error loading products for dropdown:', error);
    }
}

// Attach remove item listeners
function attachRemoveItemListeners() {
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemsContainer = document.getElementById('order-items-container');
            const items = itemsContainer.querySelectorAll('.order-item');
            
            // Don't remove if it's the last item
            if (items.length > 1) {
                itemsContainer.removeChild(this.parentElement);
            }
        });
    });
}

// Open edit modal
async function openEditModal(type, id) {
    try {
        let response;
        
        if (type === 'product') {
            response = await fetch(`${API_BASE_URL}/products/${id}`);
        } else if (type === 'supplier') {
            response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
        } else if (type === 'order') {
            response = await fetch(`${API_BASE_URL}/orders/${id}`);
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch item');
        }
        
        const data = await response.json();
        currentModalData = data;
        currentModalType = type;
        
        let modalContent = '';
        
        if (type === 'product') {
            modalContent = `
                <h3>Edit Product</h3>
                <form id="edit-product-form">
                    <div class="form-group">
                        <label for="edit-sku">SKU</label>
                        <input type="text" id="edit-sku" value="${data.sku}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-name">Name</label>
                        <input type="text" id="edit-name" value="${data.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-price">Price</label>
                        <input type="number" id="edit-price" step="0.01" value="${data.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-stock">Stock</label>
                        <input type="number" id="edit-stock" value="${data.stock}" required>
                    </div>
                    <button type="submit" class="submit-btn">Update Product</button>
                </form>
            `;
        } else if (type === 'supplier') {
            modalContent = `
                <h3>Edit Supplier</h3>
                <form id="edit-supplier-form">
                    <div class="form-group">
                        <label for="edit-supplier-name">Name</label>
                        <input type="text" id="edit-supplier-name" value="${data.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-supplier-contact">Contact</label>
                        <input type="text" id="edit-supplier-contact" value="${data.contact}" required>
                    </div>
                    <button type="submit" class="submit-btn">Update Supplier</button>
                </form>
            `;
        } else if (type === 'order') {
            modalContent = `
                <h3>Edit Order</h3>
                <form id="edit-order-form">
                    <div class="form-group">
                        <label for="edit-order-status">Status</label>
                        <select id="edit-order-status">
                            <option value="pending" ${data.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="shipped" ${data.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${data.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-btn">Update Order</button>
                </form>
            `;
        }
        
        modalBody.innerHTML = modalContent;
        modal.classList.add('active');
        
        // Attach event listener to the edit form
        if (type === 'product') {
            document.getElementById('edit-product-form').addEventListener('submit', (e) => updateItem(e, type, id));
        } else if (type === 'supplier') {
            document.getElementById('edit-supplier-form').addEventListener('submit', (e) => updateItem(e, type, id));
        } else if (type === 'order') {
            document.getElementById('edit-order-form').addEventListener('submit', (e) => updateItem(e, type, id));
        }
        
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Error loading item details');
    }
}

// Update an item
async function updateItem(e, type, id) {
    e.preventDefault();
    
    let updatedData = {};
    
    if (type === 'product') {
        updatedData = {
            sku: document.getElementById('edit-sku').value,
            name: document.getElementById('edit-name').value,
            price: parseFloat(document.getElementById('edit-price').value),
            stock: parseInt(document.getElementById('edit-stock').value)
        };
    } else if (type === 'supplier') {
        updatedData = {
            name: document.getElementById('edit-supplier-name').value,
            contact: document.getElementById('edit-supplier-contact').value
        };
    } else if (type === 'order') {
        updatedData = {
            status: document.getElementById('edit-order-status').value,
            // Keep other fields unchanged
            supplierId: currentModalData.supplierId._id || currentModalData.supplierId,
            items: currentModalData.items
        };
    }
    
    try {
        let endpoint;
        if (type === 'product') {
            endpoint = `${API_BASE_URL}/products/${id}`;
        } else if (type === 'supplier') {
            endpoint = `${API_BASE_URL}/suppliers/${id}`;
        } else if (type === 'order') {
            endpoint = `${API_BASE_URL}/orders/${id}`;
        }
        
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
            modal.classList.remove('active');
            
            // Refresh the relevant section
            if (type === 'product') {
                loadProducts();
                populateProductDropdown();
            } else if (type === 'supplier') {
                loadSuppliers();
                populateSupplierDropdown();
            } else if (type === 'order') {
                loadOrders();
            }
            
            loadDashboardData();
        } else {
            alert(`Error updating ${type}`);
        }
    } catch (error) {
        console.error(`Error updating ${type}:`, error);
        alert(`Error updating ${type}`);
    }
}

// Delete an item
async function deleteItem(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }
    
    try {
        let endpoint;
        if (type === 'product') {
            endpoint = `${API_BASE_URL}/products/${id}`;
        } else if (type === 'supplier') {
            endpoint = `${API_BASE_URL}/suppliers/${id}`;
        } else if (type === 'order') {
            endpoint = `${API_BASE_URL}/orders/${id}`;
        }
        
        const response = await fetch(endpoint, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
            
            // Refresh the relevant section
            if (type === 'product') {
                loadProducts();
                populateProductDropdown();
            } else if (type === 'supplier') {
                loadSuppliers();
                populateSupplierDropdown();
            } else if (type === 'order') {
                loadOrders();
            }
            
            loadDashboardData();
        } else {
            alert(`Error deleting ${type}`);
        }
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Error deleting ${type}`);
    }
}

// View order details
async function viewOrderDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);
        const order = await response.json();
        
        let itemsHTML = '';
        if (order.items && order.items.length > 0) {
            itemsHTML = order.items.map(item => `
                <div class="order-detail-item">
                    <strong>${item.productId?.sku || 'Unknown'}:</strong> 
                    ${item.productId?.name || 'Unknown Product'} - 
                    Qty: ${item.qty}, Price: $${item.price}
                </div>
            `).join('');
        } else {
            itemsHTML = '<p>No items in this order</p>';
        }
        
        const modalContent = `
            <h3>Order Details</h3>
            <div class="order-details">
                <p><strong>Supplier:</strong> ${order.supplierId?.name || 'Unknown'}</p>
                <p><strong>Contact:</strong> ${order.supplierId?.contact || 'Unknown'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
                <h4>Items:</h4>
                ${itemsHTML}
                <p><strong>Total Items:</strong> ${order.items?.length || 0}</p>
            </div>
        `;
        
        modalBody.innerHTML = modalContent;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error viewing order details:', error);
        alert('Error loading order details');
    }
}

// Add some CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: capitalize;
    }
    
    .status-badge.pending {
        background-color: #ffcc00;
        color: #333;
    }
    
    .status-badge.shipped {
        background-color: #3498db;
        color: white;
    }
    
    .status-badge.delivered {
        background-color: #2ecc71;
        color: white;
    }
    
    .order-details {
        margin-top: 20px;
    }
    
    .order-detail-item {
        padding: 10px;
        background-color: #f5f5f5;
        margin-bottom: 8px;
        border-radius: 5px;
    }
`;
document.head.appendChild(style);