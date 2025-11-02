# Requirements Document

## Introduction

The Sweet Shop Management System is a full-stack web application that enables users to browse, search, and purchase sweets from an online inventory, while providing administrators with capabilities to manage the sweet catalog and inventory levels. The system consists of a Node.js/Express backend with PostgreSQL database and a Next.js frontend with modern UI components.

## Glossary

- **System**: The Sweet Shop Management System (backend API and frontend application)
- **User**: A registered customer who can browse and purchase sweets
- **Admin**: A privileged user who can manage sweets inventory and catalog
- **Sweet**: A product item in the catalog with properties including name, category, price, and quantity
- **JWT Token**: JSON Web Token used for authentication and authorization
- **Inventory**: The collection of all sweets with their current stock quantities

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a new customer, I want to register an account with my email and password, so that I can access the sweet shop and make purchases.

#### Acceptance Criteria

1. WHEN a user submits valid registration credentials, THE System SHALL create a new user account and return a 201 status code with the user identifier
2. IF a user attempts to register with an email that already exists, THEN THE System SHALL reject the registration and return a 400 status code
3. THE System SHALL hash user passwords before storing them in the database
4. WHEN a registered user submits valid login credentials, THE System SHALL authenticate the user and return a 200 status code with a JWT Token
5. IF a user submits invalid login credentials, THEN THE System SHALL reject the authentication attempt and return a 401 status code

### Requirement 2: Sweet Catalog Browsing

**User Story:** As a user, I want to view all available sweets with their details, so that I can decide what to purchase.

#### Acceptance Criteria

1. WHEN a user requests the sweet catalog, THE System SHALL return all sweets with their name, category, price, and quantity
2. THE System SHALL display sweets in a card-based layout with product information visible
3. WHEN a sweet has zero quantity, THE System SHALL display an "Out of Stock" indicator
4. THE System SHALL disable the purchase button for sweets with zero quantity

### Requirement 3: Sweet Search and Filtering

**User Story:** As a user, I want to search and filter sweets by name or category, so that I can quickly find specific products.

#### Acceptance Criteria

1. WHEN a user provides a name search term, THE System SHALL return only sweets whose names match the search criteria
2. WHEN a user selects a category filter, THE System SHALL return only sweets belonging to that category
3. THE System SHALL support case-insensitive search operations

### Requirement 4: Sweet Purchase

**User Story:** As a user, I want to purchase a sweet, so that I can acquire the product and the inventory is updated accordingly.

#### Acceptance Criteria

1. WHEN an authenticated user purchases a sweet, THE System SHALL decrease the sweet quantity by one unit
2. IF a user attempts to purchase a sweet with zero quantity, THEN THE System SHALL reject the purchase and return a 400 status code
3. IF an unauthenticated user attempts to purchase a sweet, THEN THE System SHALL reject the request and return a 401 status code
4. WHEN a purchase is successful, THE System SHALL return a 200 status code with updated sweet information

### Requirement 5: Sweet Catalog Management

**User Story:** As an admin, I want to create, update, and delete sweets in the catalog, so that I can maintain an accurate product inventory.

#### Acceptance Criteria

1. WHEN an admin creates a new sweet with valid data, THE System SHALL add the sweet to the catalog and return a 201 status code
2. IF a non-authenticated user attempts to create a sweet, THEN THE System SHALL reject the request and return a 401 status code
3. WHEN an admin updates a sweet, THE System SHALL modify the sweet properties and return a 200 status code with updated data
4. WHEN an admin with valid credentials deletes a sweet, THE System SHALL remove the sweet from the catalog and return a 200 status code
5. IF a non-admin user attempts to delete a sweet, THEN THE System SHALL reject the request and return a 403 status code

### Requirement 6: Inventory Restocking

**User Story:** As an admin, I want to restock sweets by increasing their quantity, so that customers can continue purchasing popular items.

#### Acceptance Criteria

1. WHEN an admin submits a restock request with a valid quantity, THE System SHALL increase the sweet quantity by the specified amount
2. IF a non-admin user attempts to restock inventory, THEN THE System SHALL reject the request and return a 403 status code
3. THE System SHALL validate that restock quantities are positive integers
4. WHEN a restock operation succeeds, THE System SHALL return a 200 status code with updated inventory information

### Requirement 7: User Interface Authentication

**User Story:** As a user, I want to log in through a web interface, so that I can access my account without using API tools directly.

#### Acceptance Criteria

1. WHEN a user submits login credentials through the login form, THE System SHALL authenticate the user and store the JWT Token locally
2. THE System SHALL redirect authenticated users to the dashboard page after successful login
3. WHEN a user submits registration information through the registration form, THE System SHALL create the account and authenticate the user
4. THE System SHALL display validation errors for invalid form inputs before submission

### Requirement 8: Data Persistence

**User Story:** As a system operator, I want all user and sweet data stored in a PostgreSQL database, so that data persists across application restarts.

#### Acceptance Criteria

1. THE System SHALL store user records with unique identifiers, email addresses, hashed passwords, and role assignments
2. THE System SHALL store sweet records with unique identifiers, names, categories, prices, and quantities
3. THE System SHALL enforce email uniqueness constraints at the database level
4. THE System SHALL use UUID data types for all record identifiers
