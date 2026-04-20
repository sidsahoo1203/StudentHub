# Student Application Management System

A comprehensive full-stack web application for managing student applications, built with React (Vite) on the frontend and Spring Boot (Java) on the backend.

## 🚀 Complete Technology Stack

### Frontend

- JavaScript (ES Modules)
- React 18
- Vite 5
- @vitejs/plugin-react
- React Router DOM 6
- Axios
- React Icons
- React Toastify
- Vanilla CSS (custom glassmorphism and dark-mode UI)
- Node.js and npm (for dependency management and scripts)

### Backend

- Java 17
- Spring Boot 3.2.3
- Spring Boot Starter Web (REST APIs)
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation (Jakarta Validation)
- Hibernate (via Spring Data JPA)
- H2 Database (file-based DB at ./data/studentdb)
- Spring Boot DevTools
- Spring Boot Starter Test (testing support)
- Maven / Maven Wrapper (mvn, mvnw)

### Project and Dev Configuration

- Vite dev server on port 5173
- Vite proxy for /api -> http://localhost:8080
- Spring Boot backend on port 8080
- CORS configured for http://localhost:5173
- H2 console enabled at /h2-console
- SQL seed data through src/main/resources/data.sql

## 🛠️ Project Structure

```text
/
├── backend/                # Spring Boot Backend
│   ├── src/main/java...    # Java source code
│   ├── src/main/resources/ # application.properties, data.sql (seed data)
│   └── pom.xml             # Maven configuration
│
└── frontend/               # React Frontend
    ├── src/components/     # Layout, Dashboard, Lists, Forms
    ├── src/services/       # Axios API integration
    ├── src/index.css       # Global styling & theming
    └── package.json        # NPM dependencies
```

## 🏃‍♂️ How to Run

## ✅ Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- (Optional) Maven installed globally if you do not use Maven Wrapper

### 1. Start the Backend (Spring Boot)

From the project root, open a terminal and run:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell, you can also use:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

If Maven is installed globally, this also works:

```bash
cd backend
mvn spring-boot:run
```

Backend runs at http://localhost:8080.

Quick backend checks:

- API: http://localhost:8080/api/students
- H2 console: http://localhost:8080/h2-console

### 2. Start the Frontend (React)

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173.

### 3. Run Both Together (Recommended)

- Terminal 1:

```bash
cd backend
./mvnw spring-boot:run
```

- Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## 💻 New Laptop Setup

If you extract this project on a new laptop, install these first:

- Java 17 or higher
- Node.js 18+ with npm

Then run the app in this order:

1. Open a terminal in the project root.
2. Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

3. Open another terminal and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser.

You do not need to install MySQL or any other database, because the backend uses a local H2 database file.

## 📌 Latest Functional Updates

The project now includes stricter application validation and richer academic data capture.

### 1. Application Approve/Reject Validation

- Approve validation is criteria-based and runs for both:
  - New user creation
  - Existing user updates
- Approval rules:
  - Minimum CGPA depends on course:
    - M.Tech / MBA / MCA: 7.0
    - B.Tech / BCA / BBA: 6.0
    - Other courses: 6.5
  - Schooling percentage requirement:
    - PG-style courses (starting with M): minimum 60%
    - UG-style courses: minimum 50%
- Reject validation:
  - Rejection requires a reason in Admin Notes (minimum 10 characters).

### 2. Academic Details Improvements

- Added Schooling Details as multi-row data (dynamic Add button in form).
- Each schooling entry stores:
  - Qualification
  - School/College Name
  - Board/University
  - Percentage
  - Passing Year

### 3. Course Applied For Dropdown

- Course is now selected from dropdown options in the form:
  - B.Tech, M.Tech, MBA, MCA, BCA, BBA

### 4. Year of Study Removed

- Year of Study has been removed from:
  - Backend model and logic
  - Frontend form and detail pages
  - Seed data

## 🗄️ How To Open H2 Database Console

After backend is running, open this URL in browser:

- http://localhost:8080/h2-console

Use the following connection values:

- Driver Class: org.h2.Driver
- JDBC URL: jdbc:h2:file:./data/studentdb
- User Name: sa
- Password: (leave empty)

Then click Connect.

### Quick Steps

1. Start backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

2. Open H2 console at http://localhost:8080/h2-console
3. Enter the values above and click Connect
4. Run SQL, for example:

```sql
SELECT * FROM students;
```
