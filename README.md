# Carz - Toy Swap & Marketplace Server

A robust backend server for a toy marketplace and swapping platform. This application allows users to list toys, manage an inventory, and perform credit-based swaps with other users.

## 💡 The Problem & Solution

### The Problem
- **High Costs**: Quality toys and die-cast models are expensive.
- **Short Lifespan**: Kids outgrow toys quickly, leading to clutter.
- **Waste**: Unwanted toys often end up in landfills.

### The Solution: "Toy Swap Circle"
We created a **Credit-Based Exchange System**. Instead of spending cash, users:
1.  **List old toys** to earn virtual credits.
2.  **Spend credits** to get "new" toys from others.
3.  **Reduce waste** by keeping toys in circulation.

## 🚀 Features

### 🔄 Toy Swap System
- **Credit Economy**: Users earn credits by listing/swapping toys and spend credits to acquire new ones.
- **Secure Transactions**: Atomic-like swap operations ensure credits are deducted and added correctly while ownership is transferred.
- **Inventory Management**: Users can track their own toys and see what is available in the community.

### 📦 Marketplace Core
- **CRUD Operations**: Full Create, Read, Update, Delete support for toy listings.
- **Search & Filter**: (Coming Soon) Find toys by name, category, or price.
- **User Profiles**: Track user credits, swap history, and reputation.

### 🏗 Architecture
- **3-Layer Design**: Built with a clean Controller-Service-Model architecture for scalability.
- **MongoDB Native**: Uses the official MongoDB driver for maximum performance and flexibility.

---

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Architecture**: MVC (Model-View-Controller) / Layered

---

## 🔌 API Endpoints

### 🧸 Toys
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/toys` | Get all **available** toys (excludes swapped items). |
| `GET` | `/toys/:id` | Get details of a specific toy. |
| `POST` | `/toys` | List a new toy. Requires `creditCost` and `sellerEmail`. |
| `PUT` | `/toys/:id` | Update toy details (Price, Description, Quantity). |
| `DELETE` | `/toys/:id` | Remove a toy listing. |
| `GET` | `/mytoys?email=...` | Get all toys listed by a specific user. |

### 👤 Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users` | Register a new user. **Bonus**: 50 starting credits! |
| `GET` | `/users/:email` | Get user profile (Credits, Swap Count). |

### 🤝 Swaps
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/swap` | Execute a swap. Requires `toyId`, `buyerEmail`, `sellerEmail`. |

---

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd toy-marketplace-server-side
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (see `.env.example`).
    ```env
    DB_USER=your_mongodb_username
    DB_PASS=your_mongodb_password
    PORT=5000
    ```

4.  **Run the Server**
    ```bash
    # Development Mode
    npm run start
    
    # Or directly
    node index.js
    ```

5.  **Test the API**
    The server will start on `http://localhost:5000`.
    - Health Check: `GET http://localhost:5000/hi`

---

## 📂 Project Structure
```
src/
├── config/       # Configuration files
├── controllers/  # Request handlers
├── models/       # Database interactions
├── routes/       # API route definitions
├── services/     # Business logic
└── utils/        # Utility functions (DB connection)
```
