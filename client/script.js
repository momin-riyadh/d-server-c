const API_URL = 'http://localhost:3000';

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return token;
}

// Add new contact
document.getElementById('addContactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = checkAuth();
    if (!token) return;

    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, mobile }),
        });

        if (response.ok) {
            document.getElementById('addContactForm').reset();
            fetchContacts();
        } else {
            alert('Failed to create contact');
        }
    } catch (error) {
        console.error('Error adding contact:', error);
    }
});

// Update fetchContacts function to include token
async function fetchContacts() {
    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

// ... existing authentication and fetch code ...

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

// Add these functions for edit and delete functionality
async function editContact(id) {
    const token = checkAuth();
    if (!token) return;

    const name = prompt('Enter new name:');
    const mobile = prompt('Enter new mobile:');

    if (name && mobile) {
        try {
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, mobile }),
            });

            if (response.ok) {
                fetchContacts();
            } else {
                alert('Failed to update contact');
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    }
}

async function deleteContact(id) {
    const token = checkAuth();
    if (!token) return;

    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            const response = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchContacts();
            } else {
                alert('Failed to delete contact');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    }
}

// ... rest of your existing code ...


// Call fetchContacts when page loads
fetchContacts();