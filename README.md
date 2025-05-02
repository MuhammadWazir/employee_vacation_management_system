# Vacation Management App

A full-stack vacation management system built with **ASP.NET Core** and **React**. This application enables employees to manage their vacation requests, and provides secure user registration, authentication, profile updates, and full CRUD operations on vacation records.

## Features

### Authentication & Authorization
- JWT-based secure login and registration
- Password complexity validation
- Email format validation
- Identity error handling
- Protected routes and role-based access

### User Account Management
- Update username, email, and password
- Delete account with password confirmation
- Field-level validations and error feedback

### Vacation Management
- Create vacation with start and end date
- View vacations with pagination
- Update and delete vacations (only by owner)
- Validation for date ranges and required fields
- Duration automatically calculated from dates

## Tech Stack

- **Backend:** ASP.NET Core (.NET 9), Entity Framework Core
- **Frontend:** React (with hooks), Bootstrap, and CSS
- **Database:** SQL Server
- **Authentication:** JWT Tokens
- **API Testing:** Postman and Swagger

## Setup Instructions

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/)
- [Node.js & npm](https://nodejs.org/)
- SQL Server instance

### Backend
1. Navigate to the API project folder.
2. Configure your connection string in `appsettings.json`.
3. Run migrations:
   ```bash
   dotnet ef database update
   ```
4. Launch the API:
   ```bash
   dotnet run watch
   ```

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm run dev
   ```

## API Overview

| Endpoint                   | Method | Description                  | Auth Required |
|----------------------------|--------|------------------------------|---------------|
| `/Backend/account/login`   | POST   | Login and get JWT token      |no             |
| `/Backend/account/register`| POST   | Register a new user          |no             |
| `/Backend/account/update`  | PUT    | Update account details       |yes            |
| `/Backend/account/delete`  | DELETE | Delete account               |yes            |
| `/api/Vacation`            | GET    | Get paginated vacations list |yes            |
| `/api/Vacation/{id}`       | GET    | Get single vacation          |yes            |
| `/api/Vacation`            | POST   | Create new vacation          |yes            |
| `/api/Vacation/{id}`       | PUT    | Update a vacation            |yes            |
| `/api/Vacation/{id}`       | DELETE | Delete a vacation            |yes            |

## Testing Summary

All major functionalities were tested and passed including:
- Login/Register
- Invalid inputs and authentication failures
- Vacation creation, updates, deletions
- Ownership enforcement on vacations
- Validation of date logic and required fields