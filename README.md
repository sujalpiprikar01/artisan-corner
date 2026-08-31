# Artisan's Corner

### Multi-Vendor E-Commerce Marketplace for Handmade Goods

Artisan's Corner is a full-stack multi-vendor e-commerce platform designed for artisans and independent sellers to showcase and sell handmade products online.

The platform allows buyers to browse products, manage their shopping cart, place orders, make payments, and submit reviews. Vendors can create their stores, manage products and inventory, monitor orders, and view sales analytics. An admin module provides marketplace-level management.

---

## Live Application

**Frontend:**  
https://artisan-corner-three.vercel.app/

**Backend API:**  
https://artisan-corner-jb9u.onrender.com

**GitHub Repository:**  
https://github.com/sujalpiprikar01/artisan-corner

---

## Project Overview

Traditional handmade product sellers often lack the technical resources required to build and maintain their own e-commerce websites.

Artisan's Corner provides a centralized marketplace where multiple artisans can:

- Create their seller profile
- Manage their own store
- Add and manage products
- Upload product images
- Manage inventory
- Track orders
- View sales analytics

Customers can:

- Browse products from multiple vendors
- View detailed product information
- Add products to cart
- Manage cart quantities
- Checkout with shipping information
- Make online payments
- View order history
- Submit product reviews and ratings

---

## User Roles

The platform supports three primary roles:

### Buyer

Buyers can:

- Register and login
- Browse products
- View product details
- Add products to cart
- Update cart quantities
- Remove products from cart
- Checkout
- Place orders
- View order history
- Submit reviews and ratings

### Vendor

Vendors can:

- Become a seller
- Create and manage their store
- Add products
- Upload product images
- Edit products
- Delete products
- Manage stock
- View their orders
- View sales analytics

### Admin

Administrators can:

- Monitor marketplace activity
- Manage users
- Manage products
- Monitor orders
- Access administrative functionality

---

## Key Features

### Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- Role-based authorization
- Vendor authorization
- Admin authorization

### Vendor Management

- Vendor onboarding
- Store profile management
- Vendor dashboard
- Product management
- Inventory management
- Seller order management
- Sales analytics

### Product Management

- Create products
- Read products
- Update products
- Delete products
- Product categories
- Product stock management
- Product image upload
- Vendor-product relationship

### Cloudinary Image Upload

Product images are uploaded using:

**Frontend → Backend → Multer → Cloudinary → MongoDB**

The application stores the secure Cloudinary URL instead of storing image files directly inside MongoDB.

### Shopping Cart

- Add products to cart
- Increase/decrease quantity
- Remove products
- Persistent cart
- Cart data stored using localStorage

### Checkout & Orders

The checkout process includes:

1. Review cart
2. Enter shipping information
3. Process payment
4. Create order
5. Display order confirmation
6. View order history

### Payments

Stripe is integrated for payment processing.

The payment architecture keeps sensitive Stripe secret credentials on the backend.

The project also includes marketplace commission logic.

Example:

```text
Product Price = $100
Platform Commission = 5%
Platform Fee = $5
Vendor Amount = $95
````

Vendor payout recording can be simulated according to the project scope.

### Reviews & Ratings

Customers can provide:

* 1–5 star ratings
* Written reviews
* Product feedback

Reviews are associated with users and products.

### Seller Analytics

Vendors can view sales-related information through the analytics dashboard.

### Admin Dashboard

The admin dashboard provides marketplace-level management and monitoring functionality.

---

# Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* React Router DOM
* Tailwind CSS
* Fetch API
* localStorage

## Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs
* Multer

## Database

* MongoDB
* Mongoose

## External Services

* Cloudinary – Product image storage
* Stripe – Payment processing

## Deployment

* Vercel – Frontend
* Render – Backend
* MongoDB Atlas – Database

## Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │       Users         │
                    │ Buyer / Vendor /    │
                    │       Admin         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  MongoDB   │   │ Cloudinary │   │   Stripe   │
       │  Database  │   │   Images   │   │  Payments  │
       └────────────┘   └────────────┘   └────────────┘
```

---

# Database Models

The application uses MongoDB with Mongoose.

### User

Stores user authentication and role information.

Main fields include:

* name
* email
* password
* role
* store information

### Product

Stores product information.

Main fields include:

* name
* description
* price
* category
* image
* vendor
* stock
* timestamps

### Order

Stores customer order information including:

* buyer
* ordered products
* shipping information
* payment information
* order status
* timestamps

### Review

Stores product reviews and ratings.

Main fields include:

* user
* product
* rating
* review
* timestamps

### MockPayment

Used for payment-related functionality where applicable within the project scope.

---

# Project Structure

```text
artisan-corner/
│
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── vendorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── MockPayment.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── utils/
│   │   └── pricing.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── MyOrders.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── BecomeSeller.jsx
│   │   ├── SellerDashboard.jsx
│   │   ├── SellerProducts.jsx
│   │   ├── AddProduct.jsx
│   │   ├── EditProduct.jsx
│   │   ├── SellerOrders.jsx
│   │   ├── SellerAnalytics.jsx
│   │   ├── StoreManagement.jsx
│   │   └── AdminDashboard.jsx
│   │
│   └── utils/
│       ├── api.js
│       ├── cart.js
│       └── format.js
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

# API Modules

The backend follows a RESTful API architecture.

Main API modules include:

| Module         | Purpose                            |
| -------------- | ---------------------------------- |
| Authentication | Registration and Login             |
| Users          | User and seller-related operations |
| Products       | Product CRUD and product listing   |
| Orders         | Order creation and management      |
| Payments       | Payment processing                 |
| Reviews        | Product ratings and reviews        |
| Admin          | Administrative operations          |

---

# Security

Security was considered throughout the application.

Implemented practices include:

* JWT authentication
* Password hashing using bcrypt
* Protected API routes
* Role-based authorization
* Vendor-only routes
* Admin-only routes
* Environment variables
* `.gitignore` configuration
* Secure API credential management

Sensitive credentials such as:

```text
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
STRIPE_SECRET_KEY
```

are stored in environment variables and are not committed to GitHub.

---

# Testing

The application was tested using:

* Browser-based functional testing
* Postman API testing
* Authentication testing
* Product CRUD testing
* Image upload testing
* Cart testing
* Order testing
* Review testing
* Analytics testing
* Admin functionality testing
* Production deployment testing

---

# Deployment

The application is deployed using separate frontend and backend services.

```text
GitHub
   │
   ├── Frontend → Vercel
   │
   └── Backend → Render
                     │
                     ├── MongoDB Atlas
                     ├── Cloudinary
                     └── Stripe
```

### Backend

Hosted on Render.

```text
https://artisan-corner-jb9u.onrender.com
```

### Frontend

Hosted on Vercel.

The frontend communicates with the deployed backend through the production API URL configured using environment variables.

---

# Environment Variables

Create a `.env` file for the backend:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
```

For the frontend:

```env
VITE_API_URL=your_backend_api_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Never commit actual secret values to GitHub.

---

# Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/sujalpiprikar01/artisan-corner.git
```

```bash
cd artisan-corner
```

## 2. Install Frontend Dependencies

```bash
npm install
```

## 3. Install Backend Dependencies

```bash
cd backend
npm install
```

## 4. Configure Environment Variables

Create `.env` files according to the environment variables listed above.

## 5. Start Backend

```bash
npm start
```

or, during development:

```bash
npm run dev
```

## 6. Start Frontend

From the project root:

```bash
npm run dev
```

---

# Future Enhancements

Possible future improvements include:

* Wishlist functionality
* Advanced product filtering
* Product recommendations
* AI-based recommendations
* Email notifications
* Real-time order tracking
* Vendor verification
* Product variants
* Coupon and discount system
* Advanced analytics
* Multiple payment methods
* Automated vendor payouts
* Mobile application

---

# Learning Outcomes

This project provided practical experience in:

* Full-stack web development
* React.js development
* REST API development
* Node.js and Express.js
* MongoDB database design
* Mongoose relationships
* JWT authentication
* Role-based authorization
* Cloudinary integration
* Payment gateway integration
* E-commerce workflows
* Git and GitHub
* API testing with Postman
* Production deployment
* Environment variable management

---

# Conclusion

Artisan's Corner demonstrates the development of a complete multi-vendor e-commerce platform using the MERN stack.

The application combines authentication, role-based access control, vendor management, product CRUD operations, cloud-based image storage, shopping cart functionality, checkout, orders, reviews, analytics, administration and payment processing into a single marketplace platform.

The project provides practical implementation experience across frontend development, backend development, database management, third-party API integration, security and cloud deployment.

---

# Author

**Sujal Piprikar**


GitHub:
[https://github.com/sujalpiprikar01](https://github.com/sujalpiprikar01)

---

# License

This project was developed as an internship project for educational and professional evaluation purposes.

```
