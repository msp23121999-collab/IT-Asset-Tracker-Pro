# 🖥️ IT Asset Tracker Pro

A complete, enterprise-grade web application built to help companies track, manage, and monitor their IT assets like laptops, monitors, software licenses, and more — all from one powerful dashboard.

---

## 📸 Screenshots

### 🔐 Login Page — Super IT Admin
Admins can log in securely with email/password or Google Sign-In to access the full management panel.

![Admin Login](screenshots/whatsappimage%20(1).png)

---

### 🔐 Login Page — Employee Portal
Employees can log in to view only their assigned assets and warranty information.

![Employee Login](screenshots/whatsappimage%20(11).png)

---

### 📦 Asset Inventory
View all company assets in a clean, sortable table with status indicators, search, filter, and export options. Clicking on any asset opens a detail panel on the right side.

![Asset Inventory](screenshots/whatsappimage%20(2).png)

---

### 📋 Asset Details Panel
Select any asset to view its full details including model info, assigned user, status, image, and file attachments — all in a convenient side panel.

![Asset Details](screenshots/whatsappimage%20(4).png)

---

### 👥 Employee Management
Manage all employees in one place. View their name, email, department, role, and status. Add new employees or remove existing ones.

![Employee Management](screenshots/whatsappimage%20(5).png)

---

### 💿 Software Inventory
Track all installed software across every company device. See total devices tracked, software installations, and unique categories at a glance.

![Software Inventory](screenshots/whatsappimage%20(6).png)

---

### 🔑 License Management
Monitor software license compliance with expiry tracking. Quickly see which licenses are active, expiring soon, or already expired.

![License Management](screenshots/whatsappimage%20(7).png)

---

### 🛒 Procurement Center
Track all hardware purchases, vendor details, department allocations, purchase dates, and costs. Export the entire purchase ledger to CSV.

![Procurement Center](screenshots/whatsappimage%20(8).png)

---

### 📊 Reports
Generate and download detailed reports in Excel or PDF format — including Employee Reports, Asset Inventory, Warranty Reports, Assignment History, and Executive Summaries.

![Reports](screenshots/whatsappimage%20(9).png)

---

### 🔍 Audit Logs
Every action in the system is logged with timestamp, action type, user email, role, and details. Tracks employee additions, asset modifications, and unauthorized access attempts.

![Audit Logs](screenshots/whatsappimage%20(10).png)

---

### 👤 Employee Portal — My Assigned Assets
Employees can view their own assigned assets with full details including category, brand, model, serial number, purchase date, warranty end date, and expiry status.

![Employee Portal](screenshots/whatsappimage%20(12).png)

---

### 📧 Email Notification
The system automatically sends email notifications to employees when assets are assigned to them, including asset details, department, specs, and an image link.

![Email Notification](screenshots/whatsappimage%20(1).jpeg)

---

## 🌟 Key Features

- **Role-Based Access Control** — Super Admin, IT Admin, and Employee roles with different permissions
- **Asset Management** — Add, edit, delete, assign, and track all IT equipment
- **Employee Management** — Maintain a complete employee directory with roles and departments
- **Software Tracking** — Monitor installed applications across all company devices
- **License Compliance** — Track software license expiry dates and compliance status
- **Procurement Tracking** — Record vendor details, purchase dates, and costs for all hardware
- **Automated Warranty Alerts** — Background scheduled job sends email alerts at 20 days and 5 days before warranty expiry
- **In-App Notifications** — Real-time alerts inside the web app
- **Report Generation** — Export reports in Excel and PDF formats
- **Audit Logging** — Complete activity trail of every action performed in the system
- **Employee Self-Service Portal** — Employees can view their own assigned assets and warranty info
- **Live Firebase Sync** — Real-time database sync with Firebase Firestore
- **Image Upload** — Upload asset images using Firebase Storage
- **Google Sign-In** — OAuth authentication via Google

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + Lucide Icons |
| Database | Firebase Firestore (Real-time NoSQL) |
| Authentication | Firebase Auth (Email + Google OAuth) |
| File Storage | Firebase Storage |
| Charts | Recharts |
| Email Automation | Supabase Edge Functions (Deno) + Nodemailer |
| PDF/Excel Export | jsPDF + xlsx + PapaParse |

---

## 🚀 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A Firebase project with Firestore, Auth, and Storage enabled

### 2. Clone the Repository
```bash
git clone https://github.com/msp23121999-collab/IT-Asset-Tracker-Pro.git
cd IT-Asset-Tracker-Pro
```

### 3. Install Dependencies
```bash
cd frontend
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file inside the `frontend` folder:

```env
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

> ⚠️ **Note:** Never commit your `.env` file to GitHub. The `.gitignore` in this project already protects it.

### 5. Start the Development Server
```bash
npm run dev
```

Open your browser and go to `http://localhost:5173`

---

## 📁 Project Structure

```
IT-Asset-Tracker-Pro/
├── frontend/                # React + Vite frontend app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── contexts/        # React context providers
│   │   ├── services/        # Firebase service layer
│   │   └── lib/             # Utility functions
│   ├── .env                 # Environment variables (not committed)
│   └── package.json
├── supabase/
│   └── functions/
│       └── warranty-scheduler/  # Automated email edge function
├── firestore.rules          # Firebase security rules
├── screenshots/             # App screenshots for README
└── README.md
```

---

## 🔒 Security

- All sensitive credentials (API keys, database URLs, service accounts) are excluded from the repository via `.gitignore`
- Firebase Security Rules enforce role-based read/write access
- Unauthorized access attempts are logged in the Audit Log
- Employee accounts can only view their own assigned assets

---

## 👨‍💻 Author

**Surya Prakash M**
- GitHub: [@msp23121999-collab](https://github.com/msp23121999-collab)

---

## 📄 License

This project is open source and available for learning and reference purposes.
