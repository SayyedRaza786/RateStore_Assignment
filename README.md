# Store Rating System

A comprehensive full-stack web application for rating and managing stores, built with Express.js, React.js, and MySQL.
🚀 **Live Deployed Project Link**: [RateStore] [https://virtuous-abundance-production.up.railway.app/login]

## Features
### User Roles & Functionalities

#### System Administrator
- **Dashboard**: View total users, stores, and ratings
- **User Management**: Add, view, and filter users
- **Store Management**: Add, view, and filter stores
- **Comprehensive Filtering**: Filter by name, email, address, and role
- **User Details**: View detailed user information including store ratings for store owners

#### Normal User
- **Registration & Authentication**: Sign up and log in
- **Store Browsing**: View all registered stores with search and filter capabilities
- **Rating System**: Submit and modify ratings (1-5 stars) for stores
- **Password Management**: Update password after login

#### Store Owner
- **Dashboard**: View store performance metrics
- **Ratings Overview**: See all customers who rated their store
- **Average Rating**: Monitor store's overall rating
- **Customer Details**: View names, emails, and individual ratings

### Security Features
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers

### Form Validations
- **Name**: 20-60 characters
- **Address**: Maximum 400 characters
- **Password**: 8-16 characters with uppercase and special character
- **Email**: Standard email validation

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **cors** for cross-origin resource sharing

### Frontend
- **React.js** with hooks
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Hook Form** with Yup validation
- **React Toastify** for notifications
- **Axios** for API calls

## Project Structure

```
store-rating-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── userController.js
│   │   │   └── storeOwnerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── user.js
│   │   │   └── storeOwner.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── StarRating.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   ├── storeOwner/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   └── Unauthorized.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── GlobalStyles.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── validationSchemas.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=store_rating_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=24h
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Database Setup

The application will automatically:
- Create the database if it doesn't exist
- Create all necessary tables
- Insert a default admin user:
  - Email: `admin@storerating.com`
  - Password: `Admin@123`

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (VARCHAR 60)
- `email` (VARCHAR 255, Unique)
- `password` (VARCHAR 255, Hashed)
- `address` (TEXT 400)
- `role` (ENUM: admin, user, store_owner)
- `created_at`, `updated_at`

### Stores Table
- `id` (Primary Key)
- `name` (VARCHAR 60)
- `email` (VARCHAR 255, Unique)
- `address` (TEXT 400)
- `owner_id` (Foreign Key to users)
- `created_at`, `updated_at`

### Ratings Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `store_id` (Foreign Key to stores)
- `rating` (INT 1-5)
- `created_at`, `updated_at`
- Unique constraint on (user_id, store_id)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `PUT /api/auth/update-password` - Update password

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/stores` - Create store
- `GET /api/admin/stores` - Get all stores

### User Routes
- `GET /api/user/stores` - Get stores with ratings
- `POST /api/user/ratings` - Submit/update rating

### Store Owner Routes
- `GET /api/store-owner/dashboard` - Store dashboard

## Default Admin Account

After setup, you can log in with:
- **Email**: `admin@storerating.com`
- **Password**: `Admin@123`

## Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Password validation and hashing

✅ **User Management**
- User registration with validation
- Admin can create users with different roles
- Comprehensive user listing with filters

✅ **Store Management**
- Store registration and management
- Store listing with search capabilities
- Store owner assignment

✅ **Rating System**
- 1-5 star rating system
- Users can submit and modify ratings
- Average rating calculation
- Rating display with star components

✅ **Dashboard & Analytics**
- Admin dashboard with statistics
- Store owner dashboard with performance metrics
- User dashboard for store browsing

✅ **Security & Validation**
- Input validation on both frontend and backend
- SQL injection prevention
- XSS protection
- Rate limiting

✅ **Responsive Design**
- Mobile-friendly interface
- Modern, colorful UI
- Smooth animations and transitions

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```



Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

