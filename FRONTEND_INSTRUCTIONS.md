# Frontend Implementation Guide

This document outlines how to build the frontend for the **Carz Toy Swap** application.

## 🛠 Recommended Stack
- **Framework**: React (via Vite) or Next.js
- **Styling**: Tailwind CSS (for rapid UI development)
- **State Management**: Context API (for User & Credit balance)
- **HTTP Client**: Axios

---

## 🔐 Authentication Flow (Simplified)
Since we don't have complex auth (Firebase/JWT) yet, we use **Email-based Identity**.
1.  **Login/Register Page**:
    - Input: `Email`, `Name`, `PhotoURL`.
    - Action: Call `POST /users`.
    - Logic: If user exists, log them in. If new, they get **50 Credits**.
    - **Storage**: Save the `email` in `localStorage` to persist the session.

---

## 📄 Core Pages & Features

### 1. Home Page (`/`)
- **Hero Section**: "Give a Toy, Get a Toy. Join the Swap Circle."
- **Gallery**: Display toys from `GET /toys`.
- **Card Design**:
    - Image, Name, **Credit Cost** (e.g., "💎 20 Credits").
    - "Swap Now" button (if user has enough credits).

### 2. All Toys / Marketplace (`/all-toys`)
- **Grid Layout**: Show all available toys.
- **Search Bar**: Filter by name (Client-side filtering for now).
- **Sort**: Sort by Credit Cost (Low-High).

### 3. Toy Details (`/toy/:id`)
- **Info**: Description, Seller Name, Condition, Quantity.
- **Action**:
    - **Swap Button**: Calls `POST /swap`.
    - **Validation**: Disable button if `User Credits < Toy Cost`.

### 4. Add Toy (`/add-toy`)
- **Form Fields**:
    - Name, Picture URL, Sub-category.
    - **Credit Cost**: How many credits is this worth? (Default: 10).
    - Description.
- **Hidden Field**: `sellerEmail` (get from localStorage).

### 5. My Profile / Inventory (`/my-toys`)
- **Header**: Show **User Credits** (Fetch from `GET /users/:email`).
- **My Listings**:
    - Fetch from `GET /mytoys?email=...`.
    - Options: `Update`, `Delete`.
- **Swap History**: (Optional) Show items gained/lost.

---

## 🔄 The Swap Logic (Frontend)

When a user clicks "Swap" on a toy:
1.  **Check Credits**: Ensure `currentUser.credits >= toy.creditCost`.
2.  **Confirm**: Show a modal "Spend 20 Credits for this Mustang?".
3.  **API Call**:
    ```javascript
    axios.post('http://localhost:5000/swap', {
      toyId: toy._id,
      buyerEmail: currentUser.email,
      sellerEmail: toy.sellerEmail
    })
    ```
4.  **Success**:
    - Show "Swap Successful!" confetti.
    - Deduct credits locally (immediate UI update).
    - Redirect to "My Toys".

---

## 🎨 Design Theme (Aesthetics)
- **Primary Color**: Electric Blue (`#2563EB`) or Eco Green (`#059669`).
- **Vibe**: Playful, Modern, Clean.
- **UI Elements**:
    - Use **Badges** for "New", "Rare", "Mint Condition".
    - Use **Cards** with hover effects for toys.
