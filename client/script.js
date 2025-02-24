const API_URL = 'http://localhost:3000';
let authToken = localStorage.getItem('authToken');

// Add authentication check
function checkAuth() {
    if (!authToken) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Update fetch headers with authentication
async function fetchWithAuth(url, options = {}) {
    if (!checkAuth()) return;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
            return;
        }
        return response;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Update your existing functions to use fetchWithAuth
async function fetchContacts() {
    try {
        const response = await fetchWithAuth(`${API_URL}/contacts`);
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

// Display contacts in the list
function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';

    contacts.forEach(contact => {
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.innerHTML = `
            <div>
                <h3>${contact.name}</h3>
                <p>${contact.mobile}</p>
            </div>
            <div class="contact-actions">
                <button class="edit-btn" onclick="editContact(${contact.id})">Edit</button>
                <button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        `;
        contactsList.appendChild(contactCard);
    });
}

// Add new contact
document.getElementById('addContactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, mobile }),
        });

        if (response.ok) {
            document.getElementById('addContactForm').reset();
            fetchContacts();
        }
    } catch (error) {
        console.error('Error adding contact:', error);
    }
});

// Edit contact
async function editContact(id) {
    const name = prompt('Enter new name:');
    const mobile = prompt('Enter new mobile:');

    if (name && mobile) {
        try {
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, mobile }),
            });

            if (response.ok) {
                fetchContacts();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    }
}

// Delete contact
async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchContacts();
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    }
}

// Load contacts when page loads
fetchContacts();