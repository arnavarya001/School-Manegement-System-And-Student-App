# St. Michel School Management System - System Design

## 1. Architecture
- **Frontend**: Two React apps (Manager and Parent/Student) using Vite.
- **Backend**: Node.js/Express REST API.
- **Database**: MongoDB (Mongoose) with transactions for financial/inventory integrity.
- **Payments**: OwnPay (Self-hosted PHP service) integrated via API.
- **Storage**: Cloudinary for media.

## 2. Database Design (Collections)
- **Identity**: `Users`, `Students`, `Parents`.
- **Academic**: `Classes`, `Sections`, `Attendance`, `AcademicSessions`.
- **Finance**: `FeeCategories`, `FeeStructures`, `Bills`, `BillItems`, `Payments`, `Refunds`.
- **Inventory**: `InventoryCategories`, `Products`, `StockPurchases`, `StockTransactions`, `StudentIssuedItems`.
- **Hostel**: `Rooms`, `RoomAssignments`, `ElectricityBills`.
- **System**: `SchoolSettings`, `Announcements`, `Notifications`, `AuditLogs`.

## 3. API Endpoints (Planned)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register` (Admin only for staff)
- `GET /api/v1/auth/me`

### School Settings
- `GET /api/v1/school/settings`
- `PUT /api/v1/school/settings`

### Academic
- `GET/POST /api/v1/classes`
- `GET/POST /api/v1/classes/:id/sections`
- `GET/POST/PUT/DELETE /api/v1/students`

### Fees & Billing
- `GET/POST /api/v1/fees/categories`
- `GET/POST /api/v1/fees/structures`
- `POST /api/v1/bills/generate` (Individual or Class-wise)
- `GET /api/v1/bills/student/:studentId`
- `POST /api/v1/payments/initiate` (OwnPay Integration)
- `POST /api/v1/payments/webhook` (OwnPay Webhook)

### Inventory
- `GET/POST /api/v1/inventory/products`
- `POST /api/v1/inventory/purchase`
- `POST /api/v1/inventory/issue`

## 4. OwnPay Integration Plan
1. **Separation**: OwnPay runs on a separate PHP/MySQL environment.
2. **Initiation**: Backend calls OwnPay `/v1/checkout/create` with amount and callback.
3. **Redirect**: Parent app redirects to OwnPay checkout page.
4. **Verification**: Backend listens to Webhook. Verifies signature using `OWNPAY_WEBHOOK_SECRET`.
5. **Reconciliation**: On success, update `Bill` status and `StudentFeeAccount`.

## 5. Roadmap
- **Phase 1**: Backend Foundation (Auth, Students, Classes) - [IN PROGRESS]
- **Phase 2**: Fee Management & Billing Engine.
- **Phase 3**: Inventory & Stock Management.
- **Phase 4**: OwnPay Integration Service.
- **Phase 5**: Manager Dashboard (Frontend).
- **Phase 6**: Parent & Student App (Frontend).
- **Phase 7**: Room Rent & Electricity Modules.
- **Phase 8**: Reports & Analytics.
