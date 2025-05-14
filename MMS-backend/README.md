# Military Asset Management System

A comprehensive system for managing military assets, tracking movements, assignments, and expenditures across multiple bases with role-based access control.

## Overview

The Military Asset Management System enables commanders and logistics personnel to manage the movement, assignment, and expenditure of critical assets (such as vehicles, weapons, and ammunition) across multiple bases. The system provides transparency, streamlines logistics, and ensures accountability while offering a secure and role-based solution.

## Core Features

### Dashboard
- Display key metrics: Opening Balance, Closing Balance, Net Movement (Purchases + Transfer In - Transfer Out), Assigned and Expended assets
- Filters: Date, Base, and Equipment Type
- Detailed views for Purchases, Transfer In, and Transfer Out

### Asset Management
- Track asset inventory across multiple bases
- Monitor opening balances, closing balances, and net movements
- View available, assigned, and expended assets

### Purchases
- Record purchases for assets for specific bases
- View historical purchases with date and equipment-type filters
- Track purchase status (Ordered, Delivered, Cancelled)

### Transfers
- Facilitate asset transfers between bases
- Maintain a clear transfer history with timestamps and asset details
- Approval workflow for transfers

### Assignments & Expenditures
- Assign assets to personnel
- Track expended assets
- Monitor asset returns and status changes

### Role-Based Access Control (RBAC)
- **Admin**: Full access to all data and operations
- **Base Commander**: Access to data and operations for their assigned base
- **Logistics Officer**: Limited access to purchases and transfers

## Technical Architecture

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js

### Security
- JWT-based authentication
- Role-based access control
- API request logging for audit purposes




## Installation


1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/military-asset-management
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Documentation

The system provides a RESTful API for all operations. Detailed API documentation is available in the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

## Database Schema

The system uses the following main collections:
- Users
- Assets
- Purchases
- Transfers
- Assignments
- Expenditures
- ActivityLogs



## Security things

- All API endpoints are protected with JWT authentication
- Role-based access control ensures users can only access authorized resources
- Base-specific access restrictions for Base Commanders
- All activities are logged for audit purposes
- Passwords are hashed using bcrypt


# Military Asset Management System API Documentation

This document provides detailed information about the Military Asset Management System API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT). To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

You can obtain a JWT token by logging in through the `/api/auth/login` endpoint.

## Response Format

All API responses are in JSON format. Successful responses typically include the requested data or a success message. Error responses include an error message and sometimes additional details.

### Success Response

```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

**Access:** Admin only

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "BaseCommander",
  "assignedBase": "Base Alpha"
}
```

**Response:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "BaseCommander",
  "assignedBase": "Base Alpha",
  "_id": "60d21b4667d0d8992e610c85",
  "active": true,
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T10:00:00.000Z"
}
```

#### Login

```
POST /auth/login
```

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "BaseCommander",
    "assignedBase": "Base Alpha",
    "_id": "60d21b4667d0d8992e610c85"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

```
POST /auth/logout
```

**Access:** Authenticated users

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Logout from all devices

```
POST /auth/logout-all
```

**Access:** Authenticated users

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

#### Get current user profile

```
GET /auth/me
```

**Access:** Authenticated users

**Response:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "BaseCommander",
  "assignedBase": "Base Alpha",
  "_id": "60d21b4667d0d8992e610c85"
}
```

#### Change password

```
PUT /auth/change-password
```

**Access:** Authenticated users

**Request Body:**
```json
{
  "currentPassword": "securepassword",
  "newPassword": "newsecurepassword"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### User Management

#### Get all users

```
GET /users
```

**Access:** Admin only

**Query Parameters:**
- None

**Response:**
```json
[
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "BaseCommander",
    "assignedBase": "Base Alpha",
    "_id": "60d21b4667d0d8992e610c85",
    "active": true
  },
  {
    "username": "janedoe",
    "email": "jane.doe@example.com",
    "fullName": "Jane Doe",
    "role": "LogisticsOfficer",
    "assignedBase": "Base Bravo",
    "_id": "60d21b4667d0d8992e610c86",
    "active": true
  }
]
```

#### Get user by ID

```
GET /users/:id
```

**Access:** Admin only

**Response:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "BaseCommander",
  "assignedBase": "Base Alpha",
  "_id": "60d21b4667d0d8992e610c85",
  "active": true,
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T10:00:00.000Z"
}
```

#### Update user

```
PUT /users/:id
```

**Access:** Admin only

**Request Body:**
```json
{
  "fullName": "John M. Doe",
  "email": "john.m.doe@example.com",
  "role": "BaseCommander",
  "assignedBase": "Base Charlie",
  "active": true
}
```

**Response:**
```json
{
  "username": "johndoe",
  "email": "john.m.doe@example.com",
  "fullName": "John M. Doe",
  "role": "BaseCommander",
  "assignedBase": "Base Charlie",
  "_id": "60d21b4667d0d8992e610c85",
  "active": true,
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T11:00:00.000Z"
}
```

#### Delete (deactivate) user

```
DELETE /users/:id
```

**Access:** Admin only

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

#### Get users by base

```
GET /users/base/:base
```

**Access:** Admin and BaseCommander

**Response:**
```json
[
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "BaseCommander",
    "assignedBase": "Base Alpha",
    "_id": "60d21b4667d0d8992e610c85",
    "active": true
  },
  {
    "username": "marksmith",
    "email": "mark.smith@example.com",
    "fullName": "Mark Smith",
    "role": "LogisticsOfficer",
    "assignedBase": "Base Alpha",
    "_id": "60d21b4667d0d8992e610c87",
    "active": true
  }
]
```

### Asset Management

#### Get all assets

```
GET /assets
```

**Access:** All authenticated users

**Query Parameters:**
- `base` (string): Filter by base
- `type` (string): Filter by asset type
- `name` (string): Filter by asset name (partial match)
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')
- `limit` (number): Number of results per page (default: 10)
- `skip` (number): Number of results to skip (for pagination)

**Response:**
```json
{
  "assets": [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "M4 Rifle",
      "type": "Weapon",
      "base": "Base Alpha",
      "openingBalance": 100,
      "closingBalance": 95,
      "purchases": 0,
      "transferIn": 0,
      "transferOut": 5,
      "assigned": 80,
      "expended": 0,
      "available": 15,
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T11:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c91",
      "name": "Humvee",
      "type": "Vehicle",
      "base": "Base Alpha",
      "openingBalance": 20,
      "closingBalance": 22,
      "purchases": 2,
      "transferIn": 0,
      "transferOut": 0,
      "assigned": 18,
      "expended": 0,
      "available": 4,
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T11:00:00.000Z"
    }
  ],
  "total": 10,
  "limit": 10,
  "skip": 0,
  "hasMore": false
}
```

#### Create a new asset

```
POST /assets
```

**Access:** Admin and LogisticsOfficer

**Request Body:**
```json
{
  "name": "9mm Ammunition",
  "type": "Ammunition",
  "base": "Base Alpha",
  "openingBalance": 5000
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c92",
  "name": "9mm Ammunition",
  "type": "Ammunition",
  "base": "Base Alpha",
  "openingBalance": 5000,
  "closingBalance": 5000,
  "purchases": 0,
  "transferIn": 0,
  "transferOut": 0,
  "assigned": 0,
  "expended": 0,
  "available": 5000,
  "createdAt": "2023-06-22T12:00:00.000Z",
  "updatedAt": "2023-06-22T12:00:00.000Z"
}
```

#### Get asset by ID

```
GET /assets/:id
```

**Access:** All authenticated users

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c90",
  "name": "M4 Rifle",
  "type": "Weapon",
  "base": "Base Alpha",
  "openingBalance": 100,
  "closingBalance": 95,
  "purchases": 0,
  "transferIn": 0,
  "transferOut": 5,
  "assigned": 80,
  "expended": 0,
  "available": 15,
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T11:00:00.000Z"
}
```

#### Update asset

```
PUT /assets/:id
```

**Access:** Admin and LogisticsOfficer

**Request Body:**
```json
{
  "name": "M4A1 Rifle",
  "type": "Weapon",
  "openingBalance": 110
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c90",
  "name": "M4A1 Rifle",
  "type": "Weapon",
  "base": "Base Alpha",
  "openingBalance": 110,
  "closingBalance": 105,
  "purchases": 0,
  "transferIn": 0,
  "transferOut": 5,
  "assigned": 80,
  "expended": 0,
  "available": 25,
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T13:00:00.000Z"
}
```

#### Delete asset

```
DELETE /assets/:id
```

**Access:** Admin only

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

#### Get assets by base

```
GET /assets/base/:base
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c90",
    "name": "M4 Rifle",
    "type": "Weapon",
    "base": "Base Alpha",
    "openingBalance": 100,
    "closingBalance": 95,
    "purchases": 0,
    "transferIn": 0,
    "transferOut": 5,
    "assigned": 80,
    "expended": 0,
    "available": 15
  },
  {
    "_id": "60d21b4667d0d8992e610c91",
    "name": "Humvee",
    "type": "Vehicle",
    "base": "Base Alpha",
    "openingBalance": 20,
    "closingBalance": 22,
    "purchases": 2,
    "transferIn": 0,
    "transferOut": 0,
    "assigned": 18,
    "expended": 0,
    "available": 4
  }
]
```

#### Get assets by type

```
GET /assets/type/:type
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c90",
    "name": "M4 Rifle",
    "type": "Weapon",
    "base": "Base Alpha",
    "openingBalance": 100,
    "closingBalance": 95,
    "purchases": 0,
    "transferIn": 0,
    "transferOut": 5,
    "assigned": 80,
    "expended": 0,
    "available": 15
  },
  {
    "_id": "60d21b4667d0d8992e610c93",
    "name": "M9 Pistol",
    "type": "Weapon",
    "base": "Base Bravo",
    "openingBalance": 50,
    "closingBalance": 50,
    "purchases": 0,
    "transferIn": 0,
    "transferOut": 0,
    "assigned": 40,
    "expended": 0,
    "available": 10
  }
]
```

### Transfers

#### Get all transfers

```
GET /transfers
```

**Access:** All authenticated users (with base restrictions)

**Query Parameters:**
- `fromBase` (string): Filter by source base
- `toBase` (string): Filter by destination base
- `status` (string): Filter by status
- `startDate` (date): Filter by start date
- `endDate` (date): Filter by end date
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')
- `limit` (number): Number of results per page (default: 10)
- `skip` (number): Number of results to skip (for pagination)

**Response:**
```json
{
  "transfers": [
    {
      "_id": "60d21b4667d0d8992e610c95",
      "asset": "60d21b4667d0d8992e610c90",
      "assetName": "M4 Rifle",
      "assetType": "Weapon",
      "fromBase": "Base Alpha",
      "toBase": "Base Bravo",
      "quantity": 5,
      "status": "Completed",
      "transferredBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "approvedBy": {
        "_id": "60d21b4667d0d8992e610c86",
        "username": "janedoe",
        "fullName": "Jane Doe"
      },
      "notes": "Regular transfer",
      "createdAt": "2023-06-22T11:00:00.000Z",
      "updatedAt": "2023-06-22T11:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "skip": 0,
  "hasMore": false
}
```

#### Create a new transfer

```
POST /transfers
```

**Access:** Admin and LogisticsOfficer

**Request Body:**
```json
{
  "asset": "60d21b4667d0d8992e610c90",
  "fromBase": "Base Alpha",
  "toBase": "Base Charlie",
  "quantity": 3,
  "notes": "Emergency transfer"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c96",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "fromBase": "Base Alpha",
  "toBase": "Base Charlie",
  "quantity": 3,
  "status": "Pending",
  "transferredBy": "60d21b4667d0d8992e610c85",
  "notes": "Emergency transfer",
  "createdAt": "2023-06-22T14:00:00.000Z",
  "updatedAt": "2023-06-22T14:00:00.000Z"
}
```

#### Get transfer by ID

```
GET /transfers/:id
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c95",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "fromBase": "Base Alpha",
  "toBase": "Base Bravo",
  "quantity": 5,
  "status": "Completed",
  "transferredBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "fullName": "John Doe"
  },
  "approvedBy": {
    "_id": "60d21b4667d0d8992e610c86",
    "username": "janedoe",
    "fullName": "Jane Doe"
  },
  "notes": "Regular transfer",
  "createdAt": "2023-06-22T11:00:00.000Z",
  "updatedAt": "2023-06-22T11:30:00.000Z"
}
```

#### Approve a transfer

```
PUT /transfers/:id/approve
```

**Access:** Admin and BaseCommander (destination base)

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c96",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "fromBase": "Base Alpha",
  "toBase": "Base Charlie",
  "quantity": 3,
  "status": "Completed",
  "transferredBy": "60d21b4667d0d8992e610c85",
  "approvedBy": "60d21b4667d0d8992e610c86",
  "notes": "Emergency transfer",
  "createdAt": "2023-06-22T14:00:00.000Z",
  "updatedAt": "2023-06-22T14:30:00.000Z"
}
```

#### Cancel a transfer

```
PUT /transfers/:id/cancel
```

**Access:** Admin and LogisticsOfficer

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c96",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "fromBase": "Base Alpha",
  "toBase": "Base Charlie",
  "quantity": 3,
  "status": "Cancelled",
  "transferredBy": "60d21b4667d0d8992e610c85",
  "notes": "Emergency transfer",
  "createdAt": "2023-06-22T14:00:00.000Z",
  "updatedAt": "2023-06-22T15:00:00.000Z"
}
```

### Purchases

#### Get all purchases

```
GET /purchases
```

**Access:** All authenticated users (with base restrictions)

**Query Parameters:**
- `base` (string): Filter by base
- `assetType` (string): Filter by asset type
- `status` (string): Filter by status
- `startDate` (date): Filter by purchase date start
- `endDate` (date): Filter by purchase date end
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')
- `limit` (number): Number of results per page (default: 10)
- `skip` (number): Number of results to skip (for pagination)

**Response:**
```json
{
  "purchases": [
    {
      "_id": "60d21b4667d0d8992e610c97",
      "asset": "60d21b4667d0d8992e610c91",
      "assetName": "Humvee",
      "assetType": "Vehicle",
      "base": "Base Alpha",
      "quantity": 2,
      "unitCost": 100000,
      "totalCost": 200000,
      "supplier": "Military Vehicles Inc.",
      "purchaseDate": "2023-06-22T10:30:00.000Z",
      "deliveryDate": "2023-06-22T11:00:00.000Z",
      "status": "Delivered",
      "purchasedBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "approvedBy": {
        "_id": "60d21b4667d0d8992e610c86",
        "username": "janedoe",
        "fullName": "Jane Doe"
      },
      "invoiceNumber": "INV-12345",
      "notes": "Regular procurement",
      "createdAt": "2023-06-22T10:30:00.000Z",
      "updatedAt": "2023-06-22T11:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "skip": 0,
  "hasMore": false
}
```

#### Create a new purchase

```
POST /purchases
```

**Access:** Admin and LogisticsOfficer

**Request Body:**
```json
{
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 20,
  "unitCost": 1200,
  "supplier": "Military Weapons Inc.",
  "purchaseDate": "2023-06-22T16:00:00.000Z",
  "invoiceNumber": "INV-12346",
  "notes": "Replenishment order"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c98",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 20,
  "unitCost": 1200,
  "totalCost": 24000,
  "supplier": "Military Weapons Inc.",
  "purchaseDate": "2023-06-22T16:00:00.000Z",
  "status": "Ordered",
  "purchasedBy": "60d21b4667d0d8992e610c85",
  "invoiceNumber": "INV-12346",
  "notes": "Replenishment order",
  "createdAt": "2023-06-22T16:00:00.000Z",
  "updatedAt": "2023-06-22T16:00:00.000Z"
}
```

#### Get purchase by ID

```
GET /purchases/:id
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c97",
  "asset": "60d21b4667d0d8992e610c91",
  "assetName": "Humvee",
  "assetType": "Vehicle",
  "base": "Base Alpha",
  "quantity": 2,
  "unitCost": 100000,
  "totalCost": 200000,
  "supplier": "Military Vehicles Inc.",
  "purchaseDate": "2023-06-22T10:30:00.000Z",
  "deliveryDate": "2023-06-22T11:00:00.000Z",
  "status": "Delivered",
  "purchasedBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "fullName": "John Doe"
  },
  "approvedBy": {
    "_id": "60d21b4667d0d8992e610c86",
    "username": "janedoe",
    "fullName": "Jane Doe"
  },
  "invoiceNumber": "INV-12345",
  "notes": "Regular procurement",
  "createdAt": "2023-06-22T10:30:00.000Z",
  "updatedAt": "2023-06-22T11:00:00.000Z"
}
```

#### Mark purchase as delivered

```
PUT /purchases/:id/deliver
```

**Access:** Admin and LogisticsOfficer

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c98",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 20,
  "unitCost": 1200,
  "totalCost": 24000,
  "supplier": "Military Weapons Inc.",
  "purchaseDate": "2023-06-22T16:00:00.000Z",
  "deliveryDate": "2023-06-22T17:00:00.000Z",
  "status": "Delivered",
  "purchasedBy": "60d21b4667d0d8992e610c85",
  "approvedBy": "60d21b4667d0d8992e610c86",
  "invoiceNumber": "INV-12346",
  "notes": "Replenishment order",
  "createdAt": "2023-06-22T16:00:00.000Z",
  "updatedAt": "2023-06-22T17:00:00.000Z"
}
```

#### Cancel a purchase

```
PUT /purchases/:id/cancel
```

**Access:** Admin and LogisticsOfficer

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c98",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 20,
  "unitCost": 1200,
  "totalCost": 24000,
  "supplier": "Military Weapons Inc.",
  "purchaseDate": "2023-06-22T16:00:00.000Z",
  "status": "Cancelled",
  "purchasedBy": "60d21b4667d0d8992e610c85",
  "invoiceNumber": "INV-12346",
  "notes": "Replenishment order",
  "createdAt": "2023-06-22T16:00:00.000Z",
  "updatedAt": "2023-06-22T18:00:00.000Z"
}
```

### Assignments

#### Get all assignments

```
GET /assignments
```

**Access:** All authenticated users (with base restrictions)

**Query Parameters:**
- `base` (string): Filter by base
- `assetType` (string): Filter by asset type
- `status` (string): Filter by status
- `assignedTo` (string): Filter by assignee name
- `startDate` (date): Filter by start date
- `endDate` (date): Filter by end date
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')
- `limit` (number): Number of results per page (default: 10)
- `skip` (number): Number of results to skip (for pagination)

**Response:**
```json
{
  "assignments": [
    {
      "_id": "60d21b4667d0d8992e610c99",
      "asset": "60d21b4667d0d8992e610c90",
      "assetName": "M4 Rifle",
      "assetType": "Weapon",
      "base": "Base Alpha",
      "quantity": 10,
      "assignedTo": {
        "name": "Squad Alpha",
        "rank": "Squad",
        "id": "SQ-001"
      },
      "assignedBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "purpose": "Training Exercise",
      "startDate": "2023-06-22T12:00:00.000Z",
      "status": "Active",
      "returnedQuantity": 0,
      "notes": "Weekly training",
      "createdAt": "2023-06-22T12:00:00.000Z",
      "updatedAt": "2023-06-22T12:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "skip": 0,
  "hasMore": false
}
```

#### Create a new assignment

```
POST /assignments
```

**Access:** Admin and BaseCommander

**Request Body:**
```json
{
  "asset": "60d21b4667d0d8992e610c90",
  "base": "Base Alpha",
  "quantity": 5,
  "assignedTo": {
    "name": "Patrol Team Bravo",
    "rank": "Team",
    "id": "PT-002"
  },
  "purpose": "Border Patrol",
  "startDate": "2023-06-22T19:00:00.000Z",
  "notes": "Regular patrol duty"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c9a",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 5,
  "assignedTo": {
    "name": "Patrol Team Bravo",
    "rank": "Team",
    "id": "PT-002"
  },
  "assignedBy": "60d21b4667d0d8992e610c85",
  "purpose": "Border Patrol",
  "startDate": "2023-06-22T19:00:00.000Z",
  "status": "Active",
  "returnedQuantity": 0,
  "notes": "Regular patrol duty",
  "createdAt": "2023-06-22T19:00:00.000Z",
  "updatedAt": "2023-06-22T19:00:00.000Z"
}
```

#### Get assignment by ID

```
GET /assignments/:id
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c99",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 10,
  "assignedTo": {
    "name": "Squad Alpha",
    "rank": "Squad",
    "id": "SQ-001"
  },
  "assignedBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "fullName": "John Doe"
  },
  "purpose": "Training Exercise",
  "startDate": "2023-06-22T12:00:00.000Z",
  "status": "Active",
  "returnedQuantity": 0,
  "notes": "Weekly training",
  "createdAt": "2023-06-22T12:00:00.000Z",
  "updatedAt": "2023-06-22T12:00:00.000Z"
}
```

#### Return assigned assets

```
PUT /assignments/:id/return
```

**Access:** Admin and BaseCommander

**Request Body:**
```json
{
  "returnedQuantity": 5,
  "notes": "Partial return after training"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c99",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 10,
  "assignedTo": {
    "name": "Squad Alpha",
    "rank": "Squad",
    "id": "SQ-001"
  },
  "assignedBy": "60d21b4667d0d8992e610c85",
  "purpose": "Training Exercise",
  "startDate": "2023-06-22T12:00:00.000Z",
  "status": "Active",
  "returnedQuantity": 5,
  "notes": "Weekly training\n2023-06-22T20:00:00.000Z: Partial return after training",
  "createdAt": "2023-06-22T12:00:00.000Z",
  "updatedAt": "2023-06-22T20:00:00.000Z"
}
```

#### Update assignment status (lost/damaged)

```
PUT /assignments/:id/status
```

**Access:** Admin and BaseCommander

**Request Body:**
```json
{
  "status": "Lost",
  "notes": "Lost during field exercise"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c9a",
  "asset": "60d21b4667d0d8992e610c90",
  "assetName": "M4 Rifle",
  "assetType": "Weapon",
  "base": "Base Alpha",
  "quantity": 5,
  "assignedTo": {
    "name": "Patrol Team Bravo",
    "rank": "Team",
    "id": "PT-002"
  },
  "assignedBy": "60d21b4667d0d8992e610c85",
  "purpose": "Border Patrol",
  "startDate": "2023-06-22T19:00:00.000Z",
  "endDate": "2023-06-22T21:00:00.000Z",
  "status": "Lost",
  "returnedQuantity": 0,
  "notes": "Regular patrol duty\n2023-06-22T21:00:00.000Z: Lost during field exercise",
  "createdAt": "2023-06-22T19:00:00.000Z",
  "updatedAt": "2023-06-22T21:00:00.000Z"
}
```

### Expenditures

#### Get all expenditures

```
GET /expenditures
```

**Access:** All authenticated users (with base restrictions)

**Query Parameters:**
- `base` (string): Filter by base
- `assetType` (string): Filter by asset type
- `reason` (string): Filter by reason
- `startDate` (date): Filter by expenditure date start
- `endDate` (date): Filter by expenditure date end
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')
- `limit` (number): Number of results per page (default: 10)
- `skip` (number): Number of results to skip (for pagination)

**Response:**
```json
{
  "expenditures": [
    {
      "_id": "60d21b4667d0d8992e610c9b",
      "asset": "60d21b4667d0d8992e610c92",
      "assetName": "9mm Ammunition",
      "assetType": "Ammunition",
      "base": "Base Alpha",
      "quantity": 500,
      "reason": "Training",
      "authorizedBy": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "expendedBy": {
        "name": "Firearms Instructor",
        "rank": "Sergeant",
        "id": "SGT-123"
      },
      "operationName": "Marksmanship Training",
      "expenditureDate": "2023-06-22T13:00:00.000Z",
      "location": "Base Alpha Firing Range",
      "notes": "Weekly qualification",
      "createdAt": "2023-06-22T13:00:00.000Z",
      "updatedAt": "2023-06-22T13:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "skip": 0,
  "hasMore": false
}
```

#### Create a new expenditure

```
POST /expenditures
```

**Access:** Admin and BaseCommander

**Request Body:**
```json
{
  "asset": "60d21b4667d0d8992e610c92",
  "base": "Base Alpha",
  "quantity": 200,
  "reason": "Training",
  "expendedBy": {
    "name": "Tactical Team",
    "rank": "Team",
    "id": "TT-001"
  },
  "operationName": "CQB Training",
  "expenditureDate": "2023-06-22T22:00:00.000Z",
  "location": "Base Alpha Urban Training Facility",
  "notes": "Close quarters battle training"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c9c",
  "asset": "60d21b4667d0d8992e610c92",
  "assetName": "9mm Ammunition",
  "assetType": "Ammunition",
  "base": "Base Alpha",
  "quantity": 200,
  "reason": "Training",
  "authorizedBy": "60d21b4667d0d8992e610c85",
  "expendedBy": {
    "name": "Tactical Team",
    "rank": "Team",
    "id": "TT-001"
  },
  "operationName": "CQB Training",
  "expenditureDate": "2023-06-22T22:00:00.000Z",
  "location": "Base Alpha Urban Training Facility",
  "notes": "Close quarters battle training",
  "createdAt": "2023-06-22T22:00:00.000Z",
  "updatedAt": "2023-06-22T22:00:00.000Z"
}
```

#### Get expenditure by ID

```
GET /expenditures/:id
```

**Access:** All authenticated users (with base restrictions)

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c9b",
  "asset": "60d21b4667d0d8992e610c92",
  "assetName": "9mm Ammunition",
  "assetType": "Ammunition",
  "base": "Base Alpha",
  "quantity": 500,
  "reason": "Training",
  "authorizedBy": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "fullName": "John Doe"
  },
  "expendedBy": {
    "name": "Firearms Instructor",
    "rank": "Sergeant",
    "id": "SGT-123"
  },
  "operationName": "Marksmanship Training",
  "expenditureDate": "2023-06-22T13:00:00.000Z",
  "location": "Base Alpha Firing Range",
  "notes": "Weekly qualification",
  "createdAt": "2023-06-22T13:00:00.000Z",
  "updatedAt": "2023-06-22T13:00:00.000Z"
}
```

### Dashboard

#### Get dashboard data

```
GET /dashboard
```

**Access:** All authenticated users (with base restrictions)

**Query Parameters:**
- `base` (string): Filter by base
- `assetType` (string): Filter by asset type
- `startDate` (date): Filter by start date
- `endDate` (date): Filter by end date

**Response:**
```json
{
  "summary": {
    "totalAssets": 5,
    "totalOpeningBalance": 5170,
    "totalClosingBalance": 5167,
    "totalPurchases": 2,
    "totalTransferIn": 0,
    "totalTransferOut": 5,
    "totalAssigned": 138,
    "totalExpended": 0,
    "totalAvailable": 5029
  },
  "assetsByType": [
    {
      "type": "Weapon",
      "count": 2,
      "openingBalance": 150,
      "closingBalance": 145,
      "assigned": 120,
      "available": 25
    },
    {
      "type": "Vehicle",
      "count": 1,
      "openingBalance": 20,
      "closingBalance": 22,
      "assigned": 18,
      "available": 4
    },
    {
      "type": "Ammunition",
      "count": 2,
      "openingBalance": 5000,
      "closingBalance": 5000,
      "assigned": 0,
      "available": 5000
    }
  ],
  "recentTransfers": [
    {
      "_id": "60d21b4667d0d8992e610c95",
      "assetName": "M4 Rifle",
      "fromBase": "Base Alpha",
      "toBase": "Base Bravo",
      "quantity": 5,
      "status": "Completed",
      "createdAt": "2023-06-22T11:00:00.000Z"
    }
  ],
  "recentPurchases": [
    {
      "_id": "60d21b4667d0d8992e610c97",
      "assetName": "Humvee",
      "base": "Base Alpha",
      "quantity": 2,
      "status": "Delivered",
      "purchaseDate": "2023-06-22T10:30:00.000Z"
    }
  ],
  "recentAssignments": [
    {
      "_id": "60d21b4667d0d8992e610c99",
      "assetName": "M4 Rifle",
      "base": "Base Alpha",
      "quantity": 10,
      "assignedTo": {
        "name": "Squad Alpha",
        "id": "SQ-001"
      },
      "status": "Active",
      "startDate": "2023-06-22T12:00:00.000Z"
    }
  ],
  "recentExpenditures": [
    {
      "_id": "60d21b4667d0d8992e610c9b",
      "assetName": "9mm Ammunition",
      "base": "Base Alpha",
      "quantity": 500,
      "reason": "Training",
      "expenditureDate": "2023-06-22T13:00:00.000Z"
    }
  ]
}
```

# Military Asset Management System Database Schema

This document provides detailed information about the database schema used in the Military Asset Management System.

## Overview

The system uses MongoDB, a NoSQL document database, with Mongoose as the ODM (Object Document Mapper) for Node.js. The database consists of several collections, each representing a different entity in the system.

## Collections

### Users

The `users` collection stores information about system users, including their authentication details and role-based access control information.

```javascript
{
  _id: ObjectId,
  username: String,          // Required, unique
  password: String,          // Required, hashed
  email: String,             // Required, unique
  fullName: String,          // Required
  role: String,              // Required, enum: ['Admin', 'BaseCommander', 'LogisticsOfficer']
  assignedBase: String,      // Optional, required for BaseCommander
  active: Boolean,           // Default: true
  tokens: [{                 // Array of auth tokens
    token: String            // Required
  }],
  lastLogin: Date,           // Optional
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Assets

The `assets` collection stores information about military assets, including their inventory levels and movement history.

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  type: String,              // Required, enum: ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Other']
  base: String,              // Required
  openingBalance: Number,    // Default: 0
  closingBalance: Number,    // Default: 0
  purchases: Number,         // Default: 0
  transferIn: Number,        // Default: 0
  transferOut: Number,       // Default: 0
  assigned: Number,          // Default: 0
  expended: Number,          // Default: 0
  available: Number,         // Default: 0
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

Virtual properties:
- `netMovement`: Calculated as `purchases + transferIn - transferOut`

### Transfers

The `transfers` collection records asset transfers between bases.

```javascript
{
  _id: ObjectId,
  asset: ObjectId,           // Required, reference to Assets
  assetName: String,         // Required
  assetType: String,         // Required
  fromBase: String,          // Required
  toBase: String,            // Required
  quantity: Number,          // Required
  status: String,            // Default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled']
  transferredBy: ObjectId,   // Reference to Users
  approvedBy: ObjectId,      // Reference to Users
  notes: String,             // Optional
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Purchases

The `purchases` collection records asset purchases for specific bases.

```javascript
{
  _id: ObjectId,
  asset: ObjectId,           // Reference to Assets
  assetName: String,         // Required
  assetType: String,         // Required
  base: String,              // Required
  quantity: Number,          // Required
  unitCost: Number,          // Required
  totalCost: Number,         // Calculated: quantity * unitCost
  supplier: String,          // Required
  purchaseDate: Date,        // Default: current date
  deliveryDate: Date,        // Optional
  status: String,            // Default: 'Ordered', enum: ['Ordered', 'Delivered', 'Cancelled']
  purchasedBy: ObjectId,     // Reference to Users
  approvedBy: ObjectId,      // Reference to Users
  invoiceNumber: String,     // Optional
  notes: String,             // Optional
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Assignments

The `assignments` collection records asset assignments to personnel.

```javascript
{
  _id: ObjectId,
  asset: ObjectId,           // Required, reference to Assets
  assetName: String,         // Required
  assetType: String,         // Required
  base: String,              // Required
  quantity: Number,          // Required
  assignedTo: {              // Required
    name: String,            // Required
    rank: String,            // Required
    id: String               // Required
  },
  assignedBy: ObjectId,      // Reference to Users
  purpose: String,           // Required
  startDate: Date,           // Default: current date
  endDate: Date,             // Optional
  status: String,            // Default: 'Active', enum: ['Active', 'Returned', 'Lost', 'Damaged']
  returnedQuantity: Number,  // Default: 0
  notes: String,             // Optional
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Expenditures

The `expenditures` collection records asset expenditures.

```javascript
{
  _id: ObjectId,
  asset: ObjectId,           // Required, reference to Assets
  assetName: String,         // Required
  assetType: String,         // Required
  base: String,              // Required
  quantity: Number,          // Required
  reason: String,            // Required, enum: ['Training', 'Operation', 'Maintenance', 'Damaged', 'Lost', 'Other']
  authorizedBy: ObjectId,    // Reference to Users
  expendedBy: {              // Required
    name: String,            // Required
    rank: String,            // Required
    id: String               // Required
  },
  operationName: String,     // Optional
  expenditureDate: Date,     // Default: current date
  location: String,          // Optional
  notes: String,             // Optional
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### ActivityLogs

The `activityLogs` collection records all system activities for auditing purposes.

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // Reference to Users
  username: String,          // Optional
  action: String,            // Required, enum: ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Transfer', 'Purchase', 'Assignment', 'Expenditure']
  resourceType: String,      // Required, enum: ['Asset', 'User', 'Transfer', 'Purchase', 'Assignment', 'Expenditure']
  resourceId: ObjectId,      // Optional, reference to the affected resource
  details: Object,           // Optional, additional details about the activity
  ipAddress: String,         // Optional
  userAgent: String,         // Optional
  timestamp: Date            // Default: current date
}
```

## Relationships

The database schema includes several relationships between collections:

1. **Users to ActivityLogs**: One-to-many relationship. A user can have many activity logs.

2. **Assets to Transfers**: One-to-many relationship. An asset can be involved in many transfers.

3. **Assets to Purchases**: One-to-many relationship. An asset can have many purchase records.

4. **Assets to Assignments**: One-to-many relationship. An asset can have many assignment records.

5. **Assets to Expenditures**: One-to-many relationship. An asset can have many expenditure records.

6. **Users to Transfers/Purchases/Assignments/Expenditures**: One-to-many relationships. A user can initiate or approve many transactions.

## Indexes

To optimize query performance, the following indexes are recommended:

1. `users` collection:
   - `username`: Unique index
   - `email`: Unique index
   - `role`: Index
   - `assignedBase`: Index

2. `assets` collection:
   - `name` and `base`: Compound index
   - `type`: Index
   - `base`: Index

3. `transfers` collection:
   - `fromBase`: Index
   - `toBase`: Index
   - `status`: Index
   - `createdAt`: Index

4. `purchases` collection:
   - `base`: Index
   - `assetType`: Index
   - `status`: Index
   - `purchaseDate`: Index

5. `assignments` collection:
   - `base`: Index
   - `assetType`: Index
   - `status`: Index
   - `startDate`: Index
   - `assignedTo.name`: Index

6. `expenditures` collection:
   - `base`: Index
   - `assetType`: Index
   - `reason`: Index
   - `expenditureDate`: Index

7. `activityLogs` collection:
   - `user`: Index
   - `action`: Index
   - `resourceType`: Index
   - `timestamp`: Index

## Data Validation

Mongoose schemas include validation rules to ensure data integrity:

1. Required fields are enforced at the schema level.
2. Enum values restrict certain fields to a predefined set of values.
3. Custom validation logic is implemented for specific business rules.
4. Pre-save hooks are used for data transformation (e.g., password hashing).

## Project Structure

```
military-asset-management/
├── config/                  # Configuration files
├── middleware/              # Express middleware
│   ├── auth.js              # Authentication middleware
│   ├── baseAccess.js        # Base-specific access control
│   └── logger.js            # Activity logging middleware
├── models/                  # Mongoose models
│   ├── ActivityLog.js       # Activity log model
│   ├── Asset.js             # Asset model
│   ├── Assignment.js        # Assignment model
│   ├── Expenditure.js       # Expenditure model
│   ├── Purchase.js          # Purchase model
│   ├── Transfer.js          # Transfer model
│   └── User.js              # User model
├── routes/                  # API routes
│   ├── asset.js             # Asset routes
│   ├── assignment.js        # Assignment routes
│   ├── auth.js              # Authentication routes
│   ├── dashboard.js         # Dashboard routes
│   ├── expenditure.js       # Expenditure routes
│   ├── purchase.js          # Purchase routes
│   ├── transfer.js          # Transfer routes
│   └── user.js              # User routes
├── scripts/                 # Utility scripts
│   └── seed.js              # Database seeding script
├── .env.example             # Example environment variables
├── API_DOCUMENTATION.md     # API documentation
├── API_README.md            # API-specific README
├── DATABASE_SCHEMA.md       # Database schema documentation
├── DOCUMENTATION.md         # Comprehensive system documentation
├── README.md                # Project README
├── SETUP.md                 # Setup instructions
├── package.json             # Project dependencies
└── server.js                # Application entry point
```