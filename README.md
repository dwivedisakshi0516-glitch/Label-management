# RIT Precision Suite - Product Label Management & Printing Platform

A complete, professional, and fully functional Product Label Management & Printing Web Application built with **React**, **Vite**, **FastAPI**, and **MongoDB**.

---

## 🎯 Main Business Flow

```
ADMIN SAVES MASTER PRODUCT INFORMATION ONCE
                ↓
OPERATOR SELECTS PRODUCT
                ↓
SAVED INFORMATION AUTO-FILLS
                ↓
OPERATOR ENTERS ONLY CHANGING DATA
                ↓
LIVE LABEL PREVIEW
                ↓
SAVE TO DATABASE
                ↓
PRINT (EXACT MM DIMENSIONS)
```

---

## 🚀 Tech Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite
  - Tailwind CSS + Lucide Icons
  - Framer Motion (Smooth page transitions & 3D tilt effects)
  - Axios (JWT Authenticated REST Client)
  - Custom Toast Notifications

- **Backend**:
  - FastAPI (Python 3.10+)
  - Motor & PyMongo (Asynchronous MongoDB ODM/Driver)
  - Pydantic v2 (Schema Validation)
  - Python-Jose & Passlib (JWT Authentication & Bcrypt Password Hashing)
  - Uvicorn (ASGI Production Server)

- **Database**:
  - MongoDB (`users`, `categories`, `manufacturers`, `customer_care`, `warranties`, `products`, `label_templates`, `labels`, `settings`)

---

## 📦 Project Structure

```
apexlabel-precision-suite/
├── backend/
│   ├── app/
│   │   ├── core/           # Config and JWT security utilities
│   │   ├── database/       # Motor MongoDB connection manager
│   │   ├── routes/         # REST API endpoints (Auth, Products, Categories, Labels, etc.)
│   │   ├── schemas/        # Pydantic models for validation
│   │   ├── services/       # Database seeder for demo master records
│   │   └── main.py         # FastAPI entry point with CORS and Lifespan
│   ├── requirements.txt    # Python dependencies
│   ├── seed.py             # Standalone database seed script
│   └── .env.example        # Backend environment variables
├── src/
│   ├── components/
│   │   ├── common/         # Delete modal & loading spinners
│   │   ├── label/          # PrintableLabel with mm standards
│   │   └── layout/         # Header & responsive Sidebar
│   ├── context/            # AuthContext & ToastContext
│   ├── pages/              # Login, Dashboard, Categories, Products, Manufacturers,
│   │                       # CustomerCare, Warranty, Templates, CreateLabel, SavedLabels, Settings
│   ├── services/           # Axios API client
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx             # Master App layout and routing
│   └── index.css           # Global Tailwind and @media print styling
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI. *(An async fallback document store is included for out-of-the-box local testing even if MongoDB is not started).*

### 2. Backend Setup

```bash
# Navigate to project root
cd apexlabel-precision-suite

# Install backend dependencies
pip install -r backend/requirements.txt

# (Optional) Seed the database with initial demo records
python backend/seed.py

# Start the FastAPI backend server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be available at: **`http://localhost:8000`**
Interactive Swagger Documentation: **`http://localhost:8000/api/docs`**

### 3. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend application will run at: **`http://localhost:5173`** (or configured Vite port).

---

## 🔑 Default Credentials

| Email | Password | Role |
|---|---|---|
| `admin@rit.com` | `admin123` | System Administrator |

*(Clicking the **"Fill Demo"** button on the login screen automatically populates these credentials).*

---

## 📋 Seeded Master Demo Records

The system automatically initializes these master compliance records:
- **HP ProDesk 2 G1a Tower** (Desktop Computer - 5 Yr Warranty, MRP ₹114,229)
- **HP ProStudio 4 AIO G1i** (AIO Computer - 5 Yr Warranty, MRP ₹128,500)
- **Seqrite EPS Suite** (Antivirus - 5 Yr Warranty, MRP ₹8,499)
- **Brother DCP-L5660DN** (Mono MFM Laser - 5 Yr Warranty, MRP ₹46,990)
- **Brother HL-L5210DN** (Mono SF Laser - 5 Yr Warranty, MRP ₹29,500)
- **Brother DCP-L3560CDW** (Colour MFM LaserJet - 5 Yr Warranty, MRP ₹54,900)
- **DRC240** (Scanner - 5 Yr Warranty, MRP ₹42,500)
- **Canon iR2930** (Photocopier - 5 Yr Warranty, MRP ₹215,000)

---

## 🖨️ Physical Print Execution & Styling

When **"Print"** is clicked:
1. Browser print dialog is triggered via `window.print()`.
2. All web shell components (sidebar, navigation, header, action buttons, form inputs) are hidden using `@media print`.
3. Only the physically proportioned label is printed using `@page { size: auto; margin: 0; }` respecting exact metric measurements (e.g. `100mm × 150mm`).
4. Supports multi-copy batch printing with accurate page-breaks per sticker.

---

## 🧪 Verification & Testing Checklist

1. **Login**: Authenticate using `admin@rit.com` / `admin123`.
2. **Category Master**: Create or edit a category (e.g. `Desktop Computer`).
3. **Manufacturer Master**: Add or edit a manufacturing facility (e.g. `Flextronics Technologies India Pvt. Ltd.`).
4. **Customer Care Master**: Configure service cell contacts, telephone, toll-free, and WhatsApp details.
5. **Warranty Master**: Set standard warranty periods (e.g. `5 Years`).
6. **Product Master**: Add a product, verify category pre-fills and manufacturer dropdowns.
7. **Label Template**: Configure physical dimensions in mm, reorder fields using Move Up/Down, and customize typography.
8. **Create Label**:
   - Select Category `Desktop Computer` -> Select Product `HP ProDesk 2 G1a Tower`.
   - Verify Manufacturer, Address, Customer Care, Part Number, Generic Name, and Pack Contents auto-fill automatically.
   - Change Month to `July` and Year to `2026`.
   - Verify Live Sticker Preview updates on the fly.
   - Click **Save Label Snapshot**.
9. **Saved Labels**: Open Saved Labels, view the saved label modal, duplicate or click **Print**.
