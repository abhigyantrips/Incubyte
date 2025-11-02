# Sweet Shop Management System

A full-stack web application for managing a sweet shop's inventory and customer purchases, built with Next.js, Express, and PostgreSQL.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Sweet Catalog**: Browse and search sweets by name and category
- **Purchase System**: Authenticated users can purchase sweets with real-time inventory updates
- **Admin Dashboard**: Admin users can create, update, delete, and restock sweets
- **Role-Based Access Control**: Different permissions for regular users and administrators
- **Responsive UI**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

### Testing
- Jest for backend testing
- React Testing Library for frontend testing
- Supertest for API integration tests

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sweet-shop-management
```

2. Set up the backend
```bash
cd backend
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sweetshop
JWT_SECRET=your-secret-key
PORT=3001
```

4. Set up the database
```bash
npm run db:setup
```

5. Set up the frontend
```bash
cd ../frontend
npm install
```

6. Configure frontend environment
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Sweets
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search sweets by name or category
- `POST /api/sweets` - Create a new sweet (authenticated)
- `PUT /api/sweets/:id` - Update a sweet (authenticated)
- `DELETE /api/sweets/:id` - Delete a sweet (admin only)
- `POST /api/sweets/:id/purchase` - Purchase a sweet (authenticated)
- `POST /api/sweets/:id/restock` - Restock a sweet (admin only)

## My AI Usage

### Tools Used
I used **Kiro AI** (an AI-powered IDE assistant) throughout this project.

### Timeline
- **Document received**: November 2, 2024 at 20:48
- **Started working**: November 2, 2024 at 21:10 (22 minutes after receiving)
- **Project completed**: November 3, 2024 at 00:34
- **Total duration**: 3 hours and 24 minutes

### How I Used AI

**1. Requirements and Planning (First 30 minutes)**
I started by feeding the project requirements document to Kiro and asked it to create a structured specification. Kiro generated three key documents:
- A requirements document with user stories and acceptance criteria
- A detailed design document covering architecture, data models, and API structure
- A comprehensive task list breaking down the implementation into 15 manageable tasks

This was incredibly valuable because it forced me to think through the entire system before writing any code. The task list became my roadmap for the next few hours.

**2. Implementation (Next 2.5 hours)**
I worked through the tasks systematically, using Kiro to:
- Generate boilerplate code for Express routes and controllers
- Create database schema and migration scripts
- Build React components with proper TypeScript types
- Write API integration code with error handling

The AI was particularly helpful for repetitive tasks like creating CRUD endpoints and form components. Instead of typing everything manually, I'd describe what I needed and Kiro would generate a solid starting point that I could refine.

**3. Testing (Final 30 minutes)**
Kiro helped me write comprehensive test suites:
- Unit tests for authentication and sweet management
- Integration tests covering complete user workflows
- Frontend component tests with React Testing Library

The AI understood testing patterns and generated tests that actually caught bugs in my implementation.

### Reflection

Using Kiro fundamentally changed how I approached this project. Instead of diving straight into coding, I spent the first 30 minutes planning with AI assistance. This upfront investment paid off massively - I rarely got stuck or had to backtrack because the design was solid from the start.

The speed boost was real. Tasks that would normally take 30-40 minutes (like setting up authentication with proper password hashing, JWT tokens, and middleware) took 10-15 minutes. But it wasn't just about speed - the AI helped me maintain consistency across the codebase and catch edge cases I might have missed.

That said, I wasn't just copy-pasting AI output. I reviewed every piece of generated code, made adjustments for my specific needs, and debugged issues when tests failed. The AI was a powerful collaborator, not a replacement for thinking.

The most surprising benefit was how it reduced decision fatigue. Instead of agonizing over folder structure or naming conventions, I could ask Kiro for suggestions and move forward quickly. This kept my momentum high throughout the 3+ hour sprint.

Would I have finished this project in 3.5 hours without AI? Honestly, no. A realistic estimate would be 8-10 hours, with more time spent on documentation and testing. The AI didn't just make me faster - it made me more thorough because I had time to actually write proper tests and documentation.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth and error handling
│   │   ├── routes/          # API routes
│   │   ├── lib/             # Database connection
│   │   └── types/           # TypeScript types
│   ├── tests/               # Test suites
│   └── scripts/             # Database setup scripts
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # API client and utilities
│   └── __tests__/           # Component tests
└── .kiro/
    └── specs/               # Project specifications
```

## License

MIT
