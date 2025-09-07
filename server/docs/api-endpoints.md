# API Endpoints Documentation

## Authentication Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

---

## 1. User Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user account with OTP verification

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "number": "string",
  "email": "string",
  "password": "string"
}
```

**Response (Success - 201):**
```json
{
  "message": "OTP sent to email"
}
```

**Response (Error - 400):**
```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "field_name"
    }
  ]
}
```

---

## 2. Verify Signup OTP

**Endpoint:** `POST /api/auth/verify-signup`

**Description:** Verify the OTP sent to email and complete signup

**Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Signup successful",
  "token": "jwt_token_here"
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid or expired OTP"
}
```

---

## 3. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email/username and password, returns JWT token directly

**Request Body:**
```json
{
  "identifier": "string", // email or username
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here"
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid credentials"
}
```

**Response (Error - 400):**
```json
{
  "message": "Account not verified"
}
```

---

## 4. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Generate and send a temporary password to user's email

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Temporary password sent to your email"
}
```

**Response (Error - 400):**
```json
{
  "message": "User with this email does not exist"
}
```

**Response (Error - 400):**
```json
{
  "message": "Account not verified"
}
```

---

## Authentication Flow

### Signup Flow:
1. Client sends signup data
2. Server validates data and sends OTP to email
3. Client receives OTP and sends verification request
4. Server verifies OTP and returns JWT token

### Login Flow:
1. Client sends login credentials (email/username and password)
2. Server validates credentials and account verification status
3. Server returns JWT token immediately (no OTP required)

### Forgot Password Flow:
1. Client sends email address to forgot password endpoint
2. Server generates temporary password and saves it to user account
3. Server sends temporary password to user's email
4. User logs in with temporary password
5. User can then change password using the change password endpoint

## Error Codes

- `400` - Bad Request (validation errors, invalid credentials, expired OTP for signup only)
- `500` - Internal Server Error

## Notes

- OTP expires in 10 minutes
- Password must be at least 6 characters long
- Email must be unique
- Username must be unique
- All fields are required for signup
- JWT token is required for authenticated requests (future endpoints)
- Temporary passwords are 8 characters long and automatically generated
- Users should change their temporary password immediately after login for security

---

## Protected Routes (Require Authentication)

All protected routes require the `Authorization` header with a valid JWT token:

```
Authorization: Bearer your_jwt_token_here
```

### Base URL for User Routes
```
http://localhost:3000/api/user
```

---

## 5. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Get the authenticated user's profile

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (Success - 200):**
```json
{
  "_id": "user_id",
  "firstName": "string",
  "lastName": "string", 
  "username": "string",
  "number": "string",
  "email": "string",
  "isVerified": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Response (Error - 401):**
```json
{
  "message": "Access token is required"
}
```

---

## 6. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Update the authenticated user's profile

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "number": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "number": "string",
    "email": "string",
    "isVerified": true
  }
}
```

---

## 7. Change Password

**Endpoint:** `PUT /api/user/change-password`

**Description:** Change the authenticated user's password

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (Error - 400):**
```json
{
  "message": "Current password is incorrect"
}
```

---

## Authentication Error Responses

All protected routes may return these authentication errors:

**401 Unauthorized:**
```json
{
  "message": "Access token is required"
}
```

```json
{
  "message": "Invalid token"
}
```

```json
{
  "message": "Token expired"
}
```

```json
{
  "message": "Account not verified"
}
```

## How to Use Bearer Tokens

1. **Login or Signup** → Get JWT token
2. **Include token in headers** for protected routes:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Server verifies token** → Allows access to protected resources
