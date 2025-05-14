Military Asset Management  
//Readme generated 
## Project Overview

## Description
The Military Asset Management system is designed to streamline the management of military assets, including their acquisition, transfer, and assignment. This system provides a comprehensive dashboard for tracking assets, managing user roles, and generating detailed reports.

## Assumptions
Users have basic knowledge of military asset management processes.
The system will be accessed by authorized personnel only.
Internet connectivity is required for accessing the system.
## Limitations
The system currently supports only English language.
Real-time data synchronization is dependent on network stability.
The application is optimized for desktop use and may not be fully responsive on mobile devices.
## Key Features
User Authentication: Secure login and role-based access control.
Asset Management: Comprehensive tools for managing assets, including creation, modification, and deletion.
Transfer Management: Facilitates the transfer of assets between different bases.
Purchase Management: Tracks purchases and manages supplier information.
Reporting: Generates detailed reports on various aspects of asset management.
## Features
- Dashboard: Visualize key metrics and asset status.
- Asset Management: Track and manage military assets.
- Transfers: Facilitate asset transfers between bases.
- Purchases: Record and track asset purchases.
- Assignments: Track asset assignments to personnel.
- Expenditures: Record and track asset expenditures.
- Role-Based Access Control: Different views and permissions based on user roles.
- Responsive Design: Works on desktop, tablet, and mobile devices.
## Tech Stack
- Next.js: React framework for server-rendered applications.
- TypeScript: Type-safe JavaScript.
- Tailwind CSS: Utility-first CSS framework.
- React Query: Data fetching and state management.
- Zustand: Lightweight state management.
- Formik & Yup: Form handling and validation.
- Chart.js: Interactive charts and visualizations.
- Headless UI:  UI components.

## The Military Asset Management system has the following pages:

1. **Login Page**
   - URL: `/login`
   - Description: Authentication page for users to sign in


3. **Dashboard**
   - URL: `/dashboard`
   - Description: Main overview page with summary metrics and recent activity

4. **Assets Management**
   - **Assets List**
     - URL: `/assets`
     - Description: List of all assets with filtering, sorting, and pagination
   - **Asset Details**
     - URL: `/assets/[id]`
     - Example: `/assets/1` or `/assets/2`
     - Description: Detailed view of a specific asset with tabs for transfers, purchases, assignments, and expenditures
   - **Create New Asset**
     - URL: `/assets/new`
     - Description: Form to create a new asset

5. **Transfers Management**
   - **Transfers List**
     - URL: `/transfers`
     - Description: List of all transfers with filtering, sorting, and pagination
   - **Transfer Details**
     - URL: `/transfers/[id]`
     - Example: `/transfers/1` or `/transfers/2`
     - Description: Detailed view of a specific transfer with approval options
   - **Create New Transfer**
     - URL: `/transfers/new`
     - Description: Form to create a new transfer
     - Can also be accessed with a pre-selected asset: `/transfers/new?asset=1`

6. **Purchases Management**
   - **Purchases List**
     - URL: `/purchases`
     - Description: List of all purchases with filtering, sorting, and pagination
   - **Purchase Details**
     - URL: `/purchases/[id]`
     - Example: `/purchases/1` or `/purchases/2`
     - Description: Detailed view of a specific purchase with delivery status options
   - **Create New Purchase**
     - URL: `/purchases/new`
     - Description: Form to create a new purchase
     - Can also be accessed with a pre-selected asset: `/purchases/new?asset=1`

7. **Assignments Management**
   - **Assignments List**
     - URL: `/assignments`
     - Description: List of all assignments with filtering, sorting, and pagination
   - **Assignment Details**
     - URL: `/assignments/[id]`
     - Example: `/assignments/1` or `/assignments/2`
     - Description: Detailed view of a specific assignment with return options
   - **Return Assignment**
     - URL: `/assignments/[id]/return`
     - Description: Form to return assigned assets

8. **Expenditures Management**
   - **Expenditures List**
     - URL: `/expenditures`
     - Description: List of all expenditures with filtering, sorting, and pagination
   - **Expenditure Details**
     - URL: `/expenditures/[id]`
     - Example: `/expenditures/1` or `/expenditures/2`
     - Description: Detailed view of a specific expenditure

9. **Reports**
   - URL: `/reports`
   - Description: Generate various reports on assets, transfers, purchases, etc.
   - Features:
     - Asset Inventory Report
     - Asset Movement Report
     - Transfers Report
     - Purchases Report
     - Assignments Report
     - Expenditures Report
     - Base Report
     - Custom Report

10. **Users Management**
    - **Users List**
      - URL: `/users`
      - Description: Manage system users and their permissions
      - Features:
        - View all users
        - Filter by role, base, and status
        - Activate/deactivate users
        - Edit user details

11. **Settings**
    - URL: `/settings`
    - Description: System-wide settings and configurations
    - Features:
      - General Settings (system name, organization, date formats)
      - Asset Types Management
      - Bases Management
      - System Settings (maintenance mode, system information)


## Navigattion

1. **Starting the Application**
   - When you first load the application, you'll be automatically redirected to the login page
   - For development purposes, the authentication is mocked, so you can use any username/password
   - If you're having trouble with the login page, use `/dev-login` to bypass authentication

2. **After Login**
   - You'll be redirected to the dashboard
   - The sidebar provides navigation to all main sections
   - The top navbar shows your user information and has a logout button

3. **Assets Management**
   - From the dashboard, click on "Assets" in the sidebar
   - The assets list page allows you to:
     - Filter assets by type, base, and search term
     - Sort by clicking on column headers
     - Paginate through results
     - Click on an asset name to view details
   - To create a new asset, click the "Add Asset" button

4. **Transfers Management**
   - From the dashboard, click on "Transfers" in the sidebar
   - The transfers list page allows you to:
     - Filter transfers by base, status, and search term
     - Sort by clicking on column headers
     - Paginate through results
     - Click on a transfer to view details
   - To create a new transfer, click the "New Transfer" button
   - Base commanders can approve or cancel pending transfers

5. **Purchases Management**
   - From the dashboard, click on "Purchases" in the sidebar
   - The purchases list page allows you to:
     - Filter purchases by base, supplier, status, and search term
     - Sort by clicking on column headers
     - Paginate through results
     - Click on a purchase to view details
   - To create a new purchase, click the "New Purchase" button
   - Authorized users can mark purchases as delivered or cancel them


## File Structure
military-asset-management-frontend/
├── public/                  # Static files
├── src/                     # Source code
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── pages/               # Next.js pages
│   ├── services/            # API services
│   ├── stores/              # State management
│   ├── styles/              # Global styles
│   └── types/               # TypeScript types
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration


🔐 Role-Based Access Control (RBAC)
The Military Asset Management system implements Role-Based Access Control to ensure secure and appropriate access to features and data. Below is a breakdown of how roles, access levels, and security enforcement work.

🧑‍💼 Roles Overview
Role	Description
Admin	🔧 Full control over the entire system, including users and settings.
Base Commander	🪖 Manages operations specific to their assigned base, including approvals.
Logistics Officer	📦 Focused on logistics—transfers and purchases only.

🛂 Access Levels
Full Access – Admins Only

Can view and manage all areas of the system.

Has access to user management and system configuration.

Base-Specific Access – Base Commanders Only

Access limited to assets, transfers, and assignments at their assigned base.

Can approve or cancel asset transfers.

Logistics Operations Access – Logistics Officers Only

Can manage asset transfers and purchases.

Can view logistics-related reports only.

🛡️ Enforcement Method
✅ Authentication
JWT-based authentication is used.

After login, the user receives a JWT token.

This token must be included in all API requests.

🔒 Authorization
The backend verifies the user's JWT token.

The user's role is extracted and checked against the access policy for the requested resource.

👮 Role Verification
Every page or action has a role guard.

Example: Only Admins can access /users and change system settings.

📦 Token Management
Tokens are securely stored in localStorage.

All outgoing API calls include the token in the header.

If a token is missing or invalid, access is denied.

🔁 Session Management
On app load, the token is validated.

If valid, the user session is restored.

If invalid or expired, the user is redirected to /login.



### How to run this project



1 Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
