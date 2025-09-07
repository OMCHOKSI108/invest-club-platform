# Backend sever Overview

The backend is a Node.js + Express + MongoDB (Mongoose) service that powers the Investment Club platform. It handles user authentication, club management, contributions and payments, proposals and voting, portfolio tracking, market data integration, notifications, and reporting. JWT is used for authentication, with role-based access control for sensitive actions (owner, admin, treasurer, member). A FastAPI microservice provides real-time stock market data which the backend consumes via a dedicated market integration module. All money-related actions are logged immutably in audit logs, and contributions are processed with idempotent webhook handling to ensure no duplicate transactions.


---
```
Authentication Endpoints

Base URL: /api/auth

POST /signup → Register a new user and send OTP.
Request: { firstName, lastName, username, email, number, password }
Response: 201 { message: "OTP sent" }

POST /verify-signup → Verify OTP and complete signup.
Request: { email, otp }
Response: 200 { message: "Signup successful", token, refreshToken }

POST /login → Login with email/username and password.
Request: { identifier, password }
Response: 200 { message: "Login successful", token, refreshToken }

POST /refresh → Refresh JWT using refresh token.
Request: { refreshToken }
Response: 200 { token, refreshToken }

POST /logout → Invalidate refresh token.

POST /forgot-password → Send temporary password to email.


```
---
```

User Endpoints

Base URL: /api/user

GET /profile → Get authenticated user profile.

PUT /profile → Update profile fields.

PUT /change-password → Change user password.

POST /kyc → Upload KYC documents.

GET /kyc/status → Get KYC verification status.


```
---
```
Club Endpoints

Base URL: /api/clubs

POST / → Create new club.

GET / → List clubs (owned, joined, or public).

GET /:clubId → Get club details.

PUT /:clubId → Update club settings.

DELETE /:clubId → Delete (owner only).

POST /:clubId/invite → Invite member via email.

POST /:clubId/join → Join a club with token.

GET /:clubId/members → List club members.

PUT /:clubId/members/:userId → Update member role.

DELETE /:clubId/members/:userId → Remove member.

POST /:clubId/leave → Leave club.


```
---
```
Contribution & Payment Endpoints

Base URL: /api/clubs/:clubId/contributions

POST / → Create contribution (payment initiation).

GET / → List contributions in club.

POST /manual → Add manual contribution (treasurer).

PUT /:id/approve → Approve manual contribution.


Webhook:

POST /api/payments/webhook → Handle payment provider events (idempotent).


```
---
```
Proposal & Voting Endpoints

Base URL: /api/clubs/:clubId/proposals

POST / → Create proposal with snapshot of voting weights.

GET / → List proposals (active, past).

GET /:proposalId → Get proposal detail + votes.

POST /:proposalId/vote → Cast vote (simple/weighted).

POST /:proposalId/close → Close proposal (auto/owner).

POST /:proposalId/execute → Execute approved proposal (treasurer/admin).


```
---
```
Portfolio, Positions & Orders

Base URL: /api/clubs/:clubId

GET /portfolio → Aggregated holdings, NAV, allocation.

GET /positions → List club positions.

GET /orders → List orders.

POST /orders → Place buy/sell order.

POST /positions/:positionId/adjust → Manual adjustment.


Webhook:

POST /api/broker/webhook → Broker order update (fills).


```
---
```
Transactions & Audit

Base URL: /api/clubs/:clubId

GET /transactions → List transactions (contributions, buys, sells, payouts, fees).

GET /audit-logs → Immutable audit logs (admin only).


```
---
```
Market Data Integration

Base URL: /api/market

GET /quote?symbol=RELIANCE.NS → Get live quote (proxy to FastAPI).

GET /historical?symbol=INFY.NS&period=1M → Historical prices.

POST /subscribe → Subscribe a club to symbol updates.

POST /unsubscribe → Unsubscribe a club from symbol.

GET /subscriptions → List subscribed symbols.

POST /alert → Create price alert { symbol, conditionType, price }.

POST /price-webhook → Internal price update webhook (from FastAPI worker).


```
---
```
Files, Reports & Notifications

POST /api/clubs/:clubId/files → Upload file (receipt, agreement).

GET /api/clubs/:clubId/files → List files.

DELETE /api/clubs/:clubId/files/:fileId → Remove file.

POST /api/clubs/:clubId/reports/generate → Generate report (async).

GET /api/reports/jobs/:jobId → Check/download report.

GET /api/notifications → Get notifications.

POST /api/notifications/mark-read → Mark notifications as read.


```
---
```
Admin & System

GET /api/admin/users → List all users.

GET /api/admin/clubs → List all clubs.

POST /api/admin/kyc/:userId/verify → Verify/reject KYC.

POST /api/admin/broadcast → Broadcast message/notification.

GET /api/health → Health check.

GET /api/metrics → Internal metrics.


```
---

Notes

All protected routes require header:
Authorization: Bearer <jwt_token>

Roles enforced per club: owner, admin, treasurer, member.

Weighted voting: vote weight = member’s contribution/share %, frozen at proposal creation.

Quorum & threshold configurable in club settings.

Payment webhooks are idempotent; duplicate events are ignored.

Audit logs are immutable for compliance.



