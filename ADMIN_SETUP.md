# Admin Setup Guide

## Creating Admin User

### Method 1: Using Script (Recommended)

1. **Set environment variables** (optional, defaults will be used if not set):
   ```bash
   # In your .env file or environment
   ADMIN_EMAIL=admin@carz.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=Admin User
   ```

2. **Run the admin creation script**:
   ```bash
   node scripts/createAdmin.js
   ```

3. **Default Admin Credentials** (if no env vars set):
   - **Email**: `admin@carz.com`
   - **Password**: `admin123`
   - **Role**: `admin`

### Method 2: Using API Registration

You can register an admin user via the API:

```bash
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "email": "admin@carz.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}
```

Then manually update the role in MongoDB if needed.

### Method 3: Direct MongoDB Insert

Connect to MongoDB and insert admin user:

```javascript
db.users.insertOne({
  email: "admin@carz.com",
  password: "<bcrypt_hashed_password>",
  name: "Admin User",
  role: "admin",
  coins: 1000,
  credits: 1000,
  totalEarned: 0,
  totalSpent: 0,
  rating: 0,
  totalRatings: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Default Admin Credentials

```
Email:    admin@carz.com
Password: admin123
Role:     admin
```

⚠️ **IMPORTANT**: Change the password immediately after first login!

## Admin Features

Currently, the admin role is created but admin-specific features need to be implemented. You may want to add:

- Admin dashboard
- User management
- Shop management
- Content moderation
- Analytics and reports
- System settings

## Security Notes

1. **Change default password** immediately
2. **Use strong passwords** in production
3. **Restrict admin access** to specific IPs if possible
4. **Monitor admin activities** in production
5. **Use environment variables** for admin credentials in production

