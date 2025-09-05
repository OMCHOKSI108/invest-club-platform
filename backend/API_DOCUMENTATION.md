# Investment Club Platform API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

# 1. AUTHENTICATION ENDPOINTS

## POST /api/auth/signup
**Register a new user account with OTP verification**

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "message": "OTP sent to email"
}
```

## POST /api/auth/verify-signup
**Verify OTP and complete signup**

**Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response (200):**
```json
{
  "message": "Signup successful",
  "token": "jwt_token"
}
```

## POST /api/auth/login
**Login with email/username and password**

**Request Body:**
```json
{
  "identifier": "string", // email or username
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token"
}
```

## POST /api/auth/forgot-password
**Generate and send temporary password**

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "message": "Temporary password sent to your email"
}
```

---

# 2. USER MANAGEMENT ENDPOINTS

## GET /api/user/profile
**Get authenticated user's profile**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "isVerified": true,
  "kycStatus": "none|pending|verified|rejected",
  "roles": ["user"],
  "createdAt": "timestamp"
}
```

## PUT /api/user/profile
**Update user profile**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

## PUT /api/user/change-password
**Change user password**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

# 3. CLUB MANAGEMENT ENDPOINTS

## POST /api/clubs
**Create a new investment club**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "minContribution": 1000,
  "currency": "INR",
  "votingMode": "simple|weighted",
  "approvalThresholdPercent": 50,
  "votingPeriodDays": 7,
  "isPublic": false
}
```

**Response (201):**
```json
{
  "message": "Club created successfully",
  "club": { ... }
}
```

## GET /api/clubs
**Get all clubs (with membership info)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "club_id",
    "name": "string",
    "description": "string",
    "ownerId": { ... },
    "memberCount": 5,
    "membership": {
      "role": "member",
      "contributionAmount": 5000
    }
  }
]
```

## GET /api/clubs/:clubId
**Get club details**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "club_id",
  "name": "string",
  "description": "string",
  "ownerId": { ... },
  "minContribution": 1000,
  "votingMode": "simple",
  "memberCount": 5,
  "membership": { ... }
}
```

## PUT /api/clubs/:clubId
**Update club settings**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "minContribution": 2000
}
```

**Response (200):**
```json
{
  "message": "Club updated successfully",
  "club": { ... }
}
```

## DELETE /api/clubs/:clubId
**Delete club (owner only)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Club deleted successfully"
}
```

## POST /api/clubs/:clubId/join
**Join a public club**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Joined club successfully",
  "membership": { ... }
}
```

## GET /api/clubs/:clubId/members
**Get club members**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "member_id",
    "userId": {
      "firstName": "string",
      "lastName": "string",
      "username": "string"
    },
    "role": "member",
    "contributionAmount": 5000,
    "joinDate": "timestamp"
  }
]
```

## PUT /api/clubs/:clubId/members/:userId
**Update member role (admin/owner only)**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "admin|treasurer|member"
}
```

**Response (200):**
```json
{
  "message": "Member role updated successfully",
  "membership": { ... }
}
```

## DELETE /api/clubs/:clubId/members/:userId
**Remove member (admin/owner only)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

---

# 4. CONTRIBUTION ENDPOINTS

## POST /api/clubs/:clubId/contributions
**Create contribution**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "INR",
  "note": "Monthly contribution"
}
```

**Response (201):**
```json
{
  "message": "Contribution created successfully",
  "contribution": { ... }
}
```

## GET /api/clubs/:clubId/contributions
**Get club contributions**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "contribution_id",
    "userId": { ... },
    "amount": 5000,
    "status": "pending|succeeded|failed",
    "createdAt": "timestamp"
  }
]
```

## POST /api/clubs/:clubId/contributions/manual
**Create manual contribution (treasurer/admin)**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "amount": 5000,
  "currency": "INR",
  "note": "Manual contribution"
}
```

**Response (201):**
```json
{
  "message": "Manual contribution created successfully",
  "contribution": { ... }
}
```

## PUT /api/clubs/:clubId/contributions/:contributionId/approve
**Approve manual contribution (treasurer/admin)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Contribution approved successfully",
  "contribution": { ... },
  "transaction": { ... }
}
```

---

# 5. PROPOSAL ENDPOINTS

## POST /api/clubs/:clubId/proposals
**Create investment proposal**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Buy Apple Stock",
  "description": "Investment in AAPL",
  "amount": 10000,
  "assetType": "stock",
  "assetSymbol": "AAPL",
  "deadline": "2025-09-15T00:00:00Z"
}
```

**Response (201):**
```json
{
  "message": "Proposal created successfully",
  "proposal": { ... }
}
```

## GET /api/clubs/:clubId/proposals
**Get club proposals**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "proposal_id",
    "title": "string",
    "amount": 10000,
    "status": "active|approved|rejected",
    "votesCount": 5,
    "yesWeight": 15000,
    "deadline": "timestamp"
  }
]
```

## GET /api/clubs/:clubId/proposals/:proposalId
**Get proposal details**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "proposal_id",
  "title": "string",
  "description": "string",
  "amount": 10000,
  "votes": [ ... ],
  "userVote": { ... }
}
```

## POST /api/clubs/:clubId/proposals/:proposalId/vote
**Cast vote on proposal**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "vote": "yes|no",
  "comment": "Optional comment"
}
```

**Response (200):**
```json
{
  "message": "Vote cast successfully",
  "vote": { ... }
}
```

## POST /api/clubs/:clubId/proposals/:proposalId/close
**Close proposal (admin/owner only)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Proposal rejected",
  "proposal": { ... }
}
```

## POST /api/clubs/:clubId/proposals/:proposalId/execute
**Execute approved proposal (admin/treasurer)**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Proposal execution started",
  "proposal": { ... },
  "order": { ... }
}
```

---

# 6. PORTFOLIO ENDPOINTS

## GET /api/clubs/:clubId/portfolio
**Get club portfolio overview**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "positions": [ ... ],
  "transactions": [ ... ],
  "summary": {
    "totalValue": 50000,
    "positionCount": 3,
    "transactionCount": 15
  }
}
```

## GET /api/clubs/:clubId/positions
**Get portfolio positions**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "position_id",
    "symbol": "AAPL",
    "quantity": 10,
    "avgPrice": 150.50,
    "lastPrice": 155.20,
    "currency": "INR"
  }
]
```

## POST /api/clubs/:clubId/orders
**Create trading order**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "buy|sell",
  "symbol": "AAPL",
  "quantity": 10,
  "orderType": "market|limit",
  "limitPrice": 150.00
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": { ... }
}
```

## GET /api/clubs/:clubId/orders
**Get club orders**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "order_id",
    "type": "buy",
    "symbol": "AAPL",
    "quantity": 10,
    "status": "pending|filled",
    "createdAt": "timestamp"
  }
]
```

## GET /api/clubs/:clubId/transactions
**Get club transactions**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "transaction_id",
    "type": "contribution|buy|sell",
    "amount": 5000,
    "currency": "INR",
    "createdAt": "timestamp"
  }
]
```

## GET /api/clubs/:clubId/audit-logs
**Get audit logs**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "audit_id",
    "eventType": "contribution_succeeded",
    "userId": { ... },
    "data": { ... },
    "createdAt": "timestamp"
  }
]
```

---

# 7. MARKET ENDPOINTS

## POST /api/market/subscribe
**Subscribe to market data**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clubId": "club_id",
  "symbol": "AAPL"
}
```

**Response (201):**
```json
{
  "message": "Market subscription created successfully",
  "subscription": { ... }
}
```

## POST /api/market/unsubscribe
**Unsubscribe from market data**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clubId": "club_id",
  "symbol": "AAPL"
}
```

**Response (200):**
```json
{
  "message": "Market subscription removed successfully"
}
```

## GET /api/market/subscriptions
**Get user's market subscriptions**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "subscription_id",
    "clubId": { ... },
    "symbol": "AAPL",
    "createdAt": "timestamp"
  }
]
```

## POST /api/market/price-alert
**Create price alert**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clubId": "club_id",
  "symbol": "AAPL",
  "conditionType": "gte|lte",
  "price": 150.00,
  "notifyChannels": ["email", "chat"]
}
```

**Response (201):**
```json
{
  "message": "Price alert created successfully",
  "alert": { ... }
}
```

## GET /api/market/price-alerts/:clubId
**Get club price alerts**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "alert_id",
    "symbol": "AAPL",
    "conditionType": "gte",
    "price": 150.00,
    "enabled": true
  }
]
```

## PUT /api/market/price-alert/:alertId
**Update price alert**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "price": 155.00,
  "enabled": false
}
```

**Response (200):**
```json
{
  "message": "Price alert updated successfully",
  "alert": { ... }
}
```

## DELETE /api/market/price-alert/:alertId
**Delete price alert**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Price alert deleted successfully"
}
```

---

# 8. FILE MANAGEMENT ENDPOINTS

## POST /api/clubs/:clubId/files
**Upload file**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <file>
```

**Response (201):**
```json
{
  "message": "File uploaded successfully",
  "file": { ... }
}
```

## GET /api/clubs/:clubId/files
**Get club files**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "file_id",
    "filename": "receipt.pdf",
    "url": "/uploads/file.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "uploadedBy": { ... }
  }
]
```

## DELETE /api/clubs/:clubId/files/:fileId
**Delete file**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

---

# 9. REPORT ENDPOINTS

## POST /api/clubs/:clubId/reports/generate
**Generate report**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "summary_pdf|tax_csv",
  "params": { ... }
}
```

**Response (201):**
```json
{
  "message": "Report generation started",
  "job": { ... }
}
```

## GET /api/reports/jobs/:jobId
**Get report job status**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "job_id",
  "type": "summary_pdf",
  "status": "queued|running|done|failed",
  "resultUrl": "/reports/job_123.pdf"
}
```

## GET /api/clubs/:clubId/reports/jobs
**Get club report jobs**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "job_id",
    "type": "summary_pdf",
    "status": "done",
    "createdAt": "timestamp"
  }
]
```

---

# 10. NOTIFICATION ENDPOINTS

## GET /api/notifications
**Get user notifications**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "notification_id",
    "type": "proposal_result",
    "title": "Proposal Approved",
    "body": "Your proposal has been approved",
    "read": false,
    "createdAt": "timestamp"
  }
]
```

## PUT /api/notifications/:notificationId/read
**Mark notification as read**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

## POST /api/notifications/mark-read
**Mark all notifications as read**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

## DELETE /api/notifications/:notificationId
**Delete notification**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

# 11. WEBHOOK ENDPOINTS

## POST /api/webhooks/payments/webhook
**Payment webhook (Razorpay/Stripe)**

**Headers:**
```
Content-Type: application/json
```

**Response (200):**
```json
{
  "status": "processed"
}
```

## POST /api/webhooks/broker/webhook
**Broker order webhook**

**Headers:**
```
Content-Type: application/json
```

**Response (200):**
```json
{
  "status": "processed"
}
```

## POST /api/webhooks/market/webhook
**Market data webhook**

**Headers:**
```
Content-Type: application/json
```

**Response (200):**
```json
{
  "status": "processed"
}
```

---

# 12. SYSTEM ENDPOINTS

## GET /api/health
**Health check**

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-09-05T10:00:00.000Z",
  "uptime": 3600
}
```

---

# ERROR RESPONSES

## Authentication Errors
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

## Authorization Errors
```json
{
  "message": "Access denied"
}
```

```json
{
  "message": "Account not verified"
}
```

## Validation Errors
```json
{
  "errors": [
    {
      "msg": "Field is required",
      "param": "field_name"
    }
  ]
}
```

## Not Found Errors
```json
{
  "message": "Club not found"
}
```

```json
{
  "message": "User not found"
}
```

## Server Errors
```json
{
  "message": "Server error"
}
```

---

# RATE LIMITING

- Authentication endpoints: 5 requests per minute
- File uploads: 10 requests per minute
- Other endpoints: 100 requests per minute

---

# PAGINATION

For list endpoints, use query parameters:
```
?page=1&limit=20
```

Response format:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

# FILE UPLOAD LIMITS

- Maximum file size: 10MB
- Allowed types: JPEG, JPG, PNG, GIF, PDF, DOC, DOCX
- Storage: Local filesystem (/uploads directory)

---

# WEBHOOK SECURITY

All webhook endpoints should:
1. Verify webhook signatures
2. Store events for deduplication
3. Process events asynchronously
4. Return appropriate HTTP status codes

---

# DATA VALIDATION

All endpoints use express-validator for input validation:
- Required fields are checked
- Data types are validated
- Email formats are verified
- MongoDB ObjectIds are validated
- Custom business rules are enforced

---

# AUDIT LOGGING

All financial operations are logged:
- Contribution creation/approval
- Proposal creation/voting/execution
- Order creation/execution
- Member role changes
- Club creation/deletion

---

# NOTIFICATION TYPES

Available notification types:
- `proposal_result` - Proposal approved/rejected
- `payment_succeeded` - Payment processed
- `price_alert` - Price threshold reached
- `member_joined` - New member joined club
- `contribution_due` - Reminder for contributions

---

This documentation covers all 50+ endpoints with complete request/response formats, authentication requirements, and error handling. The API is production-ready with proper security, validation, and scalability features.
