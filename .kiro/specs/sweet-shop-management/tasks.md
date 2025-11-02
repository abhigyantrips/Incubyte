# Implementation Plan

## Backend Implementation

- [x] 1. Initialize backend project structure and dependencies
  - Create sweet-shop-backend directory with TypeScript configuration
  - Install Express, PostgreSQL driver, JWT, bcrypt, and testing dependencies
  - Configure Prettier with import sorting plugin
  - Set up Jest with Supertest for API testing
  - Create directory structure for controllers, routes, middleware, lib, and types
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Set up database connection and schema
  - Create database connection module using pg driver
  - Write SQL migration for users table with UUID, email, password, and role columns
  - Write SQL migration for sweets table with UUID, name, category, price, and quantity columns
  - Add database indexes for email, category, and name columns
  - Create database initialization script for development
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [-] 3. Implement authentication system with TDD
  - [x] 3.1 Write authentication tests
    - Write test for POST /api/auth/register with valid credentials expecting 201 status
    - Write test for duplicate email registration expecting 400 status
    - Write test for POST /api/auth/login with valid credentials expecting 200 and JWT token
    - Write test for login with invalid credentials expecting 401 status
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [x] 3.2 Implement authentication controllers and routes
    - Create auth controller with register function that hashes passwords with bcrypt
    - Create auth controller with login function that validates credentials and generates JWT
    - Implement JWT token generation with userId, email, and role in payload
    - Create auth routes connecting POST /api/auth/register and /api/auth/login to controllers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 3.3 Create authentication middleware
    - Implement authenticate middleware that verifies JWT tokens from Authorization header
    - Implement requireAdmin middleware that checks user role for admin access
    - Add error handling for missing, invalid, or expired tokens
    - _Requirements: 4.3, 5.2, 6.2_

- [x] 4. Implement sweet catalog CRUD operations with TDD
  - [x] 4.1 Write sweet CRUD tests
    - Write test for GET /api/sweets expecting array of all sweets
    - Write test for POST /api/sweets without token expecting 401 status
    - Write test for POST /api/sweets with valid token expecting 201 and created sweet
    - Write test for PUT /api/sweets/:id expecting 200 and updated sweet
    - Write test for DELETE /api/sweets/:id as non-admin expecting 403 status
    - Write test for DELETE /api/sweets/:id as admin expecting 200 status
    - _Requirements: 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 4.2 Implement sweet controllers and routes
    - Create getAllSweets controller that queries all sweets from database
    - Create createSweet controller that inserts new sweet with authentication check
    - Create updateSweet controller that modifies sweet properties
    - Create deleteSweet controller that removes sweet with admin role check
    - Create sweet routes connecting GET, POST, PUT, DELETE endpoints to controllers
    - Apply authenticate middleware to POST, PUT, DELETE routes
    - Apply requireAdmin middleware to DELETE route
    - _Requirements: 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement search and filter functionality with TDD
  - [x] 5.1 Write search and filter tests
    - Write test for GET /api/sweets/search?name=chocolate expecting filtered results
    - Write test for GET /api/sweets/search?category=candy expecting category-filtered results
    - Write test for case-insensitive name search
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.2 Implement search controller and route
    - Create searchSweets controller with name and category query parameters
    - Implement SQL query with ILIKE for case-insensitive name matching
    - Implement SQL query with WHERE clause for category filtering
    - Create search route at GET /api/sweets/search
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Implement purchase and inventory management with TDD
  - [x] 6.1 Write purchase and restock tests
    - Write test for POST /api/sweets/:id/purchase expecting quantity decreased by 1
    - Write test for purchase with zero quantity expecting 400 status
    - Write test for purchase without authentication expecting 401 status
    - Write test for POST /api/sweets/:id/restock as non-admin expecting 403 status
    - Write test for restock as admin expecting 200 and increased quantity
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4_
  - [x] 6.2 Implement purchase and restock controllers
    - Create purchaseSweet controller that decrements quantity by 1 with stock validation
    - Add check for zero quantity and return 400 error if out of stock
    - Create restockSweet controller that increases quantity by specified amount
    - Validate restock quantity is positive integer
    - Create routes for POST /api/sweets/:id/purchase and POST /api/sweets/:id/restock
    - Apply authenticate middleware to purchase route
    - Apply authenticate and requireAdmin middleware to restock route
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4_

- [x] 7. Set up Express server and error handling
  - Create Express app with JSON body parser
  - Register all route modules (auth, sweets)
  - Implement global error handling middleware with consistent error response format
  - Configure CORS for frontend communication
  - Create server startup script with database connection check
  - _Requirements: All backend requirements_

## Frontend Implementation

- [x] 8. Initialize frontend project structure and dependencies
  - Create Next.js 16 app with TypeScript and Tailwind CSS using App Router
  - Install Axios for HTTP requests
  - Install React Testing Library and Jest for component testing
  - Configure Prettier with Tailwind and import sorting plugins
  - Initialize shadcn/ui and add button, input, card, dialog, and form components
  - Create directory structure for app routes, components, lib, and tests
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Create API client and utilities
  - Create API client module with Axios instance configured for backend base URL
  - Implement token storage and retrieval functions using localStorage
  - Add request interceptor to attach JWT token to Authorization header
  - Add response interceptor to handle 401 errors and redirect to login
  - Create utility functions for API calls (register, login, getSweets, purchaseSweet, etc.)
  - _Requirements: 1.4, 7.1_

- [x] 10. Implement authentication UI with TDD
  - [x] 10.1 Write authentication component tests
    - Write test for LoginForm rendering email and password inputs
    - Write test for LoginForm submission calling login API with credentials
    - Write test for successful login storing token in localStorage
    - Write test for RegisterForm submission calling register API
    - Write test for form validation displaying error messages
    - _Requirements: 7.1, 7.2, 7.4_
  - [x] 10.2 Implement authentication components and pages
    - Create LoginForm component with email and password inputs using shadcn/ui
    - Implement form submission handler that calls login API and stores token
    - Create RegisterForm component with email and password inputs
    - Implement registration handler that calls register API and authenticates user
    - Add form validation for email format and password requirements
    - Create login page at app/(auth)/login/page.tsx with LoginForm
    - Create register page at app/(auth)/register/page.tsx with RegisterForm
    - Add redirect to dashboard after successful authentication
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11. Implement sweet catalog display with TDD
  - [x] 11.1 Write sweet component tests
    - Write test for SweetList fetching and displaying sweets from API
    - Write test for SweetCard rendering sweet name, category, price, and quantity
    - Write test for SweetCard showing "Out of Stock" when quantity is 0
    - Write test for purchase button disabled when quantity is 0
    - Write test for purchase button click calling purchaseSweet API
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1_
  - [x] 11.2 Implement sweet display components
    - Create SweetCard component displaying sweet details in shadcn/ui Card
    - Add purchase button that calls purchaseSweet API on click
    - Disable purchase button when quantity is 0 or during loading
    - Show "Out of Stock" text when quantity is 0
    - Create SweetList component that fetches sweets and renders SweetCard for each
    - Add loading state while fetching sweets
    - Create dashboard page at app/dashboard/page.tsx with SweetList
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.4_

- [x] 12. Implement search and filter UI
  - Create SearchBar component with name input and category select dropdown
  - Implement search handler that calls search API with query parameters
  - Update SweetList to accept search filters and fetch filtered results
  - Add debouncing to search input for better performance
  - Integrate SearchBar into dashboard page above SweetList
  - _Requirements: 3.1, 3.2_

- [x] 13. Implement admin panel with TDD
  - [x] 13.1 Write admin component tests
    - Write test for AdminForm rendering sweet creation form fields
    - Write test for AdminForm validation requiring all fields
    - Write test for AdminForm submission calling createSweet API
    - Write test for restock functionality calling restock API
    - _Requirements: 5.1, 6.1_
  - [x] 13.2 Implement admin components and page
    - Create AdminForm component with inputs for name, category, price, and quantity
    - Implement form submission handler that calls createSweet API
    - Add form validation for required fields and numeric values
    - Add restock button to SweetCard in admin view that calls restock API
    - Create admin page at app/admin/page.tsx with AdminForm and admin SweetList
    - Add role-based rendering to show admin page only for admin users
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.4_

- [x] 14. Add navigation and layout
  - Create root layout with navigation bar showing login/logout and role-based links
  - Add navigation links to dashboard and admin panel (admin only)
  - Implement logout functionality that clears token and redirects to login
  - Add protected route logic to redirect unauthenticated users to login
  - Style layout with Tailwind CSS for responsive design
  - _Requirements: 7.1, 7.2_

## Integration and Final Testing

- [ ] 15. End-to-end integration verification
  - Verify complete user registration and login flow
  - Test sweet browsing and purchase flow as authenticated user
  - Test admin sweet creation, update, and deletion flow
  - Test inventory restock flow as admin
  - Verify search and filter functionality
  - Test error handling for all edge cases (out of stock, unauthorized access, etc.)
  - _Requirements: All requirements_
