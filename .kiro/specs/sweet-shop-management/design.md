# Design Document

## Overview

The Sweet Shop Management System is a full-stack application built with a RESTful API backend and a modern React-based frontend. The architecture follows a three-tier pattern: presentation layer (Next.js), application layer (Express API), and data layer (PostgreSQL). Authentication is handled via JWT tokens, and the system implements role-based access control for admin operations.

## Architecture

### System Components

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│  (React 18 + TypeScript + Tailwind)    │
│  - Auth Pages (Login/Register)          │
│  - Dashboard (Sweet Catalog)            │
│  - Admin Panel (Inventory Management)   │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               │ (JWT Auth)
┌──────────────▼──────────────────────────┐
│      Express Backend API                │
│      (Node.js + TypeScript)             │
│  - Auth Routes (/api/auth)              │
│  - Sweet Routes (/api/sweets)           │
│  - Middleware (Auth, Error Handling)    │
└──────────────┬──────────────────────────┘
               │ SQL Queries
               │ (pg driver)
┌──────────────▼──────────────────────────┐
│       PostgreSQL Database               │
│  - users table                          │
│  - sweets table                         │
└─────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: Node.js with TypeScript
- Framework: Express.js
- Database: PostgreSQL with pg driver
- Authentication: jsonwebtoken + bcrypt
- Testing: Jest + Supertest
- Code Formatting: Prettier with import sorting

**Frontend:**
- Framework: Next.js 16 (App Router)
- UI Library: React 18 with TypeScript
- Styling: Tailwind CSS v4
- Component Library: shadcn/ui
- HTTP Client: Axios
- Testing: React Testing Library + Jest
- Code Formatting: Prettier with Tailwind plugin

## Components and Interfaces

### Backend API Structure

```
sweet-shop-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── sweets.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── sweets.routes.ts
│   ├── lib/
│   │   └── db.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── tests/
│   ├── auth.test.ts
│   ├── sweets.test.ts
│   └── setup.ts
├── .prettierrc.json
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Frontend Application Structure

```
sweet-shop-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── admin/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── sweets/
│       ├── sweet-list.tsx
│       ├── sweet-card.tsx
│       ├── search-bar.tsx
│       └── admin-form.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
├── __tests__/
│   ├── login-form.test.tsx
│   ├── sweet-list.test.tsx
│   ├── sweet-card.test.tsx
│   └── admin-form.test.tsx
├── .prettierrc.json
├── jest.config.js
└── tailwind.config.ts
```

### API Endpoints

#### Authentication Routes

- `POST /api/auth/register`
  - Body: `{ email: string, password: string }`
  - Response: `{ id: string, email: string, role: string }`
  - Status: 201 (success), 400 (duplicate email)

- `POST /api/auth/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, user: { id: string, email: string, role: string } }`
  - Status: 200 (success), 401 (invalid credentials)

#### Sweet Routes

- `GET /api/sweets`
  - Response: `Sweet[]`
  - Status: 200

- `GET /api/sweets/search?name=...&category=...`
  - Query: `name` (optional), `category` (optional)
  - Response: `Sweet[]`
  - Status: 200

- `POST /api/sweets` (Auth required)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name: string, category: string, price: number, quantity: number }`
  - Response: `Sweet`
  - Status: 201 (success), 401 (no auth)

- `PUT /api/sweets/:id` (Auth required)
  - Headers: `Authorization: Bearer <token>`
  - Body: `Partial<Sweet>`
  - Response: `Sweet`
  - Status: 200 (success), 401 (no auth), 404 (not found)

- `DELETE /api/sweets/:id` (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: string }`
  - Status: 200 (success), 401 (no auth), 403 (not admin)

- `POST /api/sweets/:id/purchase` (Auth required)
  - Headers: `Authorization: Bearer <token>`
  - Response: `Sweet` (with updated quantity)
  - Status: 200 (success), 400 (out of stock), 401 (no auth)

- `POST /api/sweets/:id/restock` (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ quantity: number }`
  - Response: `Sweet` (with updated quantity)
  - Status: 200 (success), 401 (no auth), 403 (not admin)

## Data Models

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### Sweets Table

```sql
CREATE TABLE sweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sweets_category ON sweets(category);
CREATE INDEX idx_sweets_name ON sweets(name);
```

### TypeScript Interfaces

#### Backend Types

```typescript
// User types
interface User {
  id: string
  email: string
  password: string
  role: 'user' | 'admin'
  created_at: Date
}

interface UserResponse {
  id: string
  email: string
  role: 'user' | 'admin'
}

interface AuthRequest {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: UserResponse
}

// Sweet types
interface Sweet {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  created_at: Date
  updated_at: Date
}

interface CreateSweetRequest {
  name: string
  category: string
  price: number
  quantity: number
}

interface RestockRequest {
  quantity: number
}

// JWT Payload
interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}
```

#### Frontend Types

```typescript
// API response types
interface Sweet {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}

interface User {
  id: string
  email: string
  role: 'user' | 'admin'
}

interface AuthResponse {
  token: string
  user: User
}

// Component prop types
interface SweetCardProps {
  sweet: Sweet
  onPurchase?: (id: string) => void
}

interface LoginFormProps {
  onSuccess?: () => void
}
```

## Authentication and Authorization

### JWT Token Flow

1. User submits credentials to `/api/auth/login` or `/api/auth/register`
2. Backend validates credentials and generates JWT token with payload: `{ userId, email, role }`
3. Token is signed with secret key and returned to client
4. Client stores token in localStorage
5. Client includes token in `Authorization: Bearer <token>` header for protected routes
6. Backend middleware verifies token and attaches user info to request object
7. Route handlers check user role for admin-only operations

### Middleware Implementation

```typescript
// auth.middleware.ts
export const authenticate = async (req, res, next) => {
  // Extract token from Authorization header
  // Verify token with JWT secret
  // Attach user info to req.user
  // Call next() or return 401
}

export const requireAdmin = (req, res, next) => {
  // Check if req.user.role === 'admin'
  // Call next() or return 403
}
```

### Protected Routes

- Authentication required: All POST/PUT/DELETE operations on sweets
- Admin role required: DELETE sweets, POST restock

## Error Handling

### Backend Error Responses

All errors follow consistent JSON structure:

```typescript
interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}
```

### HTTP Status Codes

- 200: Success (GET, PUT operations)
- 201: Created (POST operations)
- 400: Bad Request (validation errors, business logic violations)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (unexpected errors)

### Frontend Error Handling

- Display user-friendly error messages in UI
- Handle network errors gracefully
- Show loading states during async operations
- Redirect to login on 401 errors
- Display toast notifications for success/error feedback

## Testing Strategy

### Backend Testing (Jest + Supertest)

**Test Categories:**

1. **Authentication Tests** (`auth.test.ts`)
   - User registration with valid data
   - Duplicate email rejection
   - Login with valid credentials
   - Login with invalid credentials
   - JWT token generation and validation

2. **Sweet CRUD Tests** (`sweets.test.ts`)
   - Get all sweets
   - Create sweet (authenticated)
   - Create sweet (unauthenticated - should fail)
   - Update sweet
   - Delete sweet (admin only)
   - Delete sweet (non-admin - should fail)

3. **Search and Filter Tests** (`sweets.test.ts`)
   - Search by name
   - Filter by category
   - Case-insensitive search

4. **Inventory Tests** (`sweets.test.ts`)
   - Purchase sweet (decreases quantity)
   - Purchase out-of-stock sweet (should fail)
   - Restock sweet (admin only)
   - Restock sweet (non-admin - should fail)

**Test Setup:**
- Use in-memory or test PostgreSQL database
- Reset database state before each test
- Create test fixtures for users and sweets
- Mock JWT tokens for authenticated requests

### Frontend Testing (React Testing Library)

**Test Categories:**

1. **Auth Component Tests**
   - Login form submission
   - Registration form submission
   - Form validation
   - Token storage on success
   - Error message display

2. **Sweet Component Tests**
   - Sweet list rendering
   - Sweet card display
   - Purchase button disabled when out of stock
   - Purchase API call on button click
   - Loading states

3. **Admin Component Tests**
   - Admin form validation
   - Create sweet submission
   - Restock functionality
   - Admin-only UI visibility

**Test Setup:**
- Mock API calls with jest.mock
- Use React Testing Library for component rendering
- Test user interactions with userEvent
- Verify DOM updates after async operations

### Test-Driven Development Approach

1. Write failing test first
2. Implement minimal code to pass test
3. Refactor while keeping tests green
4. Repeat for each feature

### Code Formatting

Both projects use Prettier with consistent configuration:
- No semicolons
- Single quotes
- 2-space indentation
- 80 character line width
- ES5 trailing commas
- Sorted imports with separation

## Performance Considerations

- Database indexes on frequently queried columns (email, category, name)
- JWT tokens for stateless authentication (no session storage)
- Client-side token caching in localStorage
- Optimistic UI updates for better perceived performance
- Pagination can be added later if catalog grows large

## Security Considerations

- Passwords hashed with bcrypt before storage
- JWT tokens with expiration times
- SQL injection prevention via parameterized queries
- CORS configuration for frontend-backend communication
- Input validation on both client and server
- Role-based access control for admin operations
