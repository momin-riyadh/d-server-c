# Contact Manager API with Authentication

A secure contact management system with JWT authentication and role-based access control.

## Features

- User authentication with JWT
- Role-based access control (Admin, Editor, User)
- CRUD operations for contacts
- Secure API endpoints
- Client-side interface

## Prerequisites

- Node.js
- MySQL
- WAMP/XAMPP Server

## Setup

1. Clone the repository
2. Install dependencies:
```bash

```sql
npm install

CREATE DATABASE node_server;
USE node_server;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

PORT=3000
JWT_SECRET=your_jwt_secret_key

```
npm start
```

## API Endpoints
### Authentication
- POST /register - Register new user
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }
   ```
- POST /login - User login
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
   ```
### Contacts
- GET /contacts - Get all contacts
- GET /contacts/:id - Get single contact
- POST /contacts - Create new contact
  ```json
  {
    "name": "John Doe",
    "mobile": "1234567890"
  }
   ```
- PUT /contacts/:id - Update contact
  ```json
  {
    "name": "John Doe Updated",
    "mobile": "0987654321"
  }
   ```
- DELETE /contacts/:id - Delete contact
## Access Application
- Login Page: http://localhost:3000/login.html
- Main Application: http://localhost:3000/index.html
## Authentication Flow
1. Register an admin user using Postman:
   
   - URL: POST http://localhost:3000/register
   - Headers: Content-Type: application/json
   - Body: Use the admin registration JSON above
2. Login using the credentials:
   
   - Through the web interface: http://localhost:3000/login.html
   - Or via Postman: POST http://localhost:3000/login
3. The login response will include a JWT token that's automatically handled by the frontend application
## Security Features
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Protected API endpoints
- Input validation
- CORS enabled
## Project Structure
```plaintext
d-server-c/
├── client/
│   ├── index.html
│   ├── login.html
│   ├── style.css
│   ├── script.js
│   └── login.js
├── auth.js
├── index.js
├── package.json
└── .env
 ```

## Error Handling
The API returns appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
## Dependencies
- express: Web framework
- mysql2: MySQL client
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: CORS middleware
- dotenv: Environment variables
- express-validator: Input validation