# AUREVIA
## School Library Management System

AUREVIA is a modern digital School Library Management System designed to manage books, members, borrowing, returns, fines and library operations.

A production-ready, full-stack **School Library Management System** engineered with **Spring Boot 3**, **Spring Data JPA**, and a modern, high-performance responsive **Glassmorphic Single-Page Application (SPA)** with **Midnight Navy + Cyan** technology theme.

---

## 🌟 Key Real-World Features

### 1. 📊 Interactive Dashboard & Real-Time Analytics
- **Live KPI Metric Cards**:
  - Total Cataloged Books
  - Books Available on Shelves
  - Books Currently Checked Out
  - Overdue Loan Alerts (with live warning indicator)
  - Registered Students & Faculty Members
  - Total Fines Collected vs. Pending Dues
- **Quick Action Bar**: Fast one-click shortcuts to issue a book, return a book, add a new title, or register a member.
- **Recent Loan Activity Feed**: Live ledger showing the latest library transactions.

### 2. 📚 Comprehensive Book Catalog Management
- **Search & Filtering**: Search across Titles, Authors, and ISBNs in real time.
- **Category Filter Pills**: Quick filter by subjects (Computer Science, Fiction & Literature, Science, Mathematics, History, Philosophy).
- **Availability Toggle**: Filter between *All Books*, *Available Only*, or *Checked Out*.
- **Book Metadata**: Supports Book Covers, ISBN, Publisher, Publication Year, Shelf/Rack Location (e.g. `Rack CS-101`), and Synopsis.
- **Fast Issue Action**: Direct one-click book issuing straight from the catalog card.
- **CRUD Operations**: Add new titles, edit existing metadata, and delete books with validation safety.

### 3. 🔄 Circulation Desk (Issue & Return Engine)
- **Book Issuance**:
  - Select available book from dynamic searchable dropdown.
  - Link to registered member.
  - Configurable loan periods (7 days, 14 days standard, 21 days, or 30 days for faculty).
  - Automatically updates book availability to `false`.
- **Return & Fine Calculation Engine**:
  - Automatically calculates overdue days against due date.
  - Automatically computes fines ($5.00 / ₹10 per day overdue).
  - Automatically generates an itemized fine record.
  - Restores book availability to `true`.
- **Loan Status Tabs**: Filter between *Active Loans*, *⚠️ Overdue Only*, *Returned History*, or *All Records*.
- **Live Countdown Pills**: Displays days remaining (e.g. `7 day(s) left`) or overdue alerts (e.g. `5 day(s) Overdue`).

### 4. 👥 Member Management Directory
- **Role Support**: Student, Faculty/Teacher, and Staff.
- **Member Directory**: Search by student name, contact phone, or institutional email.
- **Active Loan Counters**: Shows how many books each member currently holds.
- **Membership Status**: Active, Suspended, or Expired states.

### 5. 💰 Fines & Payments Ledger
- **Automated Fine Creation**: Generated on late book returns.
- **Fine Ledger**: Displays Member, Book, Fine Date, Amount, Remarks, and Status (*PAID* vs. *PENDING*).
- **One-Click Payment Collection**: Mark fines as paid with receipt timestamp.
- **Aggregated Financial Metrics**: Real-time sum of collected revenue and outstanding receivables.

### 6. 🎨 High-Aesthetics Responsive UI
- **Zero-Dependency Vanilla CSS**: Custom glassmorphism, animated gradients, subtle shadows, and crisp typography with Google's *Plus Jakarta Sans*.
- **Theme Switcher**: Instant Dark Mode and Light Mode with persistent preference in `localStorage`.
- **Toast Notifications**: Real-time slide-in alerts for successes, warnings, and error diagnostics.
- **Instant Demo Seeder**: Includes a "✨ Load Sample Data" button that populates the library with classic & modern titles, members, active loans, and overdue records with one click!

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Spring Boot 3.0.1 (Java 17 LTS) |
| **ORM / Persistence** | Spring Data JPA, Hibernate 6.1 |
| **Database (Default)** | H2 In-Memory Database (Zero-setup, instant startup) |
| **Database (Production)** | MySQL 8.x (Configurable via Environment Variables) |
| **Aspect-Oriented Logging** | Spring AOP (`LoggingAspect` auditing execution times) |
| **Frontend** | Vanilla HTML5, Modern CSS3 (Glassmorphism), Vanilla ES6 JavaScript |
| **Testing** | JUnit 5 Jupiter, Spring Boot Test, MockMvc (80 Automated Test Cases) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 17 LTS** or higher installed (`java -version`)
- No other external installations required (Maven wrapper is bundled!)

### 1. Run Application
Open your terminal in the `springapp` directory:

```bash
cd springapp
./mvnw.cmd spring-boot:run
```
*(On Linux/macOS: `./mvnw spring-boot:run`)*

### 2. Access the Application
Open your browser and navigate to:
- **Web Application**: `http://localhost:8080/`
- **H2 Database Console**: `http://localhost:8080/h2-console`
  - *JDBC URL*: `jdbc:h2:mem:school_library`
  - *User Name*: `sa`
  - *Password*: *(leave blank)*

Click **"✨ Load Sample Data"** on the top header to explore with rich pre-loaded books, members, and transactions!

---

## ⚙️ Database Configuration

By default, the application runs out-of-the-box using the embedded **H2** database.

To switch to **MySQL** in production, configure environment variables or update `springapp/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/school_library?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

Or pass them via environment variables without touching any code:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/school_library"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="password"
export SPRING_DATASOURCE_DRIVER="com.mysql.cj.jdbc.Driver"
export SPRING_JPA_DIALECT="org.hibernate.dialect.MySQL8Dialect"
```

---

## 📡 REST API Reference

### 📚 Books (`/api/books`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Get all books |
| `GET` | `/api/books/{id}` | Get book by ID |
| `POST` | `/api/books` | Create a new book |
| `PUT` | `/api/books/{id}` | Update book details |
| `DELETE` | `/api/books/{id}` | Delete book |
| `GET` | `/api/books/title/{title}` | Search book by exact title |
| `GET` | `/api/books/category/{categoryName}` | Get books by category name |

### 🏷️ Categories (`/api/book-categories`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/book-categories` | Get all categories |
| `GET` | `/api/book-categories/{id}` | Get category by ID |
| `POST` | `/api/book-categories` | Create new category |
| `PUT` | `/api/book-categories/{id}` | Update category |
| `DELETE` | `/api/book-categories/{id}` | Delete category |
| `GET` | `/api/book-categories/page/{page}/{size}` | Get paginated categories |

### 👥 Members (`/api/members`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/members` | Get all members |
| `GET` | `/api/members/{id}` | Get member by ID |
| `POST` | `/api/members` | Register new member |
| `PUT` | `/api/members/{id}` | Update member details |
| `DELETE` | `/api/members/{id}` | Delete member |
| `GET` | `/api/members/phone/{phone}` | Find members by phone |
| `GET` | `/api/members/email/{email}` | Find members by email |

### 🔄 Borrows & Circulation (`/api/borrows`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/borrows` | Get all loans |
| `GET` | `/api/borrows/{id}` | Get loan by ID |
| `POST` | `/api/borrows` | Issue book `{ bookId, memberId, days }` |
| `POST` | `/api/borrows/{id}/return` | Return book & auto-calculate overdue fines |
| `GET` | `/api/borrows/active` | Get all currently active loans |
| `GET` | `/api/borrows/overdue` | Get all overdue loans |
| `GET` | `/api/borrows/member/{memberId}` | Get loan history for a specific member |
| `DELETE` | `/api/borrows/{id}` | Delete loan record |

### 💰 Fines (`/api/fines`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/fines` | Get all fine records |
| `GET` | `/api/fines/{id}` | Get fine by ID |
| `POST` | `/api/fines` | Create fine manually |
| `POST` | `/api/fines/{id}/pay` | Pay fine & mark as collected |
| `GET` | `/api/fines/unpaid` | Get all unpaid fines |
| `GET` | `/api/fines/stats` | Get fine revenue summary `{ totalCollected, totalPending }` |

### 📊 Dashboard & Demo (`/api/dashboard`, `/api/demo`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Real-time aggregate statistics for KPIs |
| `POST` | `/api/demo/seed` | Seed database with sample books, members & loans |
| `POST` | `/api/demo/reset` | Clear all library records |
| `GET` | `/api/demo/status` | Check if database has demo data |

---

## 🧪 Running Automated Tests

The application is covered by 80 comprehensive automated tests validating architecture, entities, repository interfaces, controllers, pagination, query methods, exceptions, and AOP.

To execute all tests:
```bash
cd springapp
./mvnw.cmd test
```

Result:
```
[INFO] Tests run: 80, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📁 Project Structure

```
School-Library-Management-System-main/
├── README.md                          # Comprehensive Documentation
└── springapp/                         # Spring Boot Application
    ├── pom.xml                        # Maven Dependencies (Spring Boot 3, JPA, H2, MySQL, AOP)
    ├── mvnw / mvnw.cmd                # Maven Wrapper
    └── src/
        ├── main/
        │   ├── java/com/examly/springapp/
        │   │   ├── SpringappApplication.java      # Application Main Entrypoint
        │   │   ├── aop/
        │   │   │   └── LoggingAspect.java         # AOP Method Execution Auditing
        │   │   ├── configuration/
        │   │   │   └── AppConfig.java             # CORS & Web MVC Configuration
        │   │   ├── controller/
        │   │   │   ├── BookController.java        # Book REST API
        │   │   │   ├── BookCategoryController.java# Category REST API & Pagination
        │   │   │   ├── BorrowController.java      # Issue/Return REST API
        │   │   │   ├── FineController.java        # Fines & Payments REST API
        │   │   │   ├── MemberController.java      # Member Directory REST API
        │   │   │   ├── DashboardController.java   # Real-Time Analytics API
        │   │   │   └── DemoDataController.java    # Sample Data Seeder API
        │   │   ├── exception/
        │   │   │   └── GlobalExceptionHandler.java# Centralized REST Error Handler
        │   │   ├── model/
        │   │   │   ├── Book.java                  # Book Entity (ISBN, Rack, Description, Cover)
        │   │   │   ├── BookCategory.java          # Category Entity
        │   │   │   ├── Borrow.java                # Borrow Entity (Dates, Due, Status, Fine)
        │   │   │   ├── Fine.java                  # Fine Entity (Amount, Paid status, Date)
        │   │   │   └── Member.java                # Member Entity (Student/Faculty, Contact)
        │   │   ├── repository/
        │   │   │   ├── BookRepo.java              # Book JPA Repository
        │   │   │   ├── BookCategoryRepo.java      # Category JPA Repository
        │   │   │   ├── BorrowRepo.java            # Borrow JPA Repository
        │   │   │   ├── FineRepo.java              # Fine JPA Repository
        │   │   │   └── MemberRepo.java            # Member JPA Repository
        │   │   └── service/
        │   │       ├── BookService.java & Impl
        │   │       ├── BookCategoryService.java & Impl
        │   │       ├── BorrowService.java & Impl   # Issue, Return & Fine Automation
        │   │       ├── FineService.java & Impl     # Payment & Ledger Balances
        │   │       └── MemberService.java & Impl
        │   └── resources/
        │       ├── application.properties         # Database & Server Settings
        │       └── static/                        # Single-Page Web Application
        │           ├── index.html                 # Modern SPA Interface
        │           ├── css/
        │           │   └── style.css              # Custom Glassmorphic Design System
        │           └── js/
        │               └── app.js                 # Reactive Frontend Client
        └── test/
            └── java/com/examly/springapp/
                └── SpringappApplicationTests.java # 80 Unit & Integration Tests
```

---

## 📜 License
Distributed under the MIT License. Built for educational and enterprise library management.
