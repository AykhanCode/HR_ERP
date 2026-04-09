# HR ERP System – Azerbaijan

A full-stack Human Resources ERP system built for Azerbaijani organisations.
The system manages employees, attendance (integrated with Hikvision devices), leaves, work-schedules, departments, and reporting – all in a single deployable stack.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2 (Java 17) |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Database | PostgreSQL 15 |
| Migrations | Flyway |
| Auth | JWT (access + refresh tokens) |
| Container | Docker / Docker Compose |

---

## Features

- **Employee Management** – create, update, search employees; manage positions & departments
- **Attendance Tracking** – real-time logs pulled from Hikvision face-recognition devices; daily summary reports
- **Leave Management** – leave type configuration (Azerbaijan labour law), request / approval workflow
- **Work Schedules** – flexible shift and schedule assignment per employee
- **Device Sync** – Hikvision IP camera / access-control integration via HTTP SDK
- **Reports** – attendance, leave, headcount reports; Excel & CSV export
- **Role-based Access Control** – `ADMIN`, `HR`, `EMPLOYEE` roles with per-endpoint security
- **Branch & Department** – multi-branch organisation structure

---

## Quick Start (Docker)

> Prerequisites: [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/AykhanCode/HR_ERP.git
cd HR_ERP
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| pgAdmin | http://localhost:5050 |

Default credentials:

| Account | Username | Password |
|---------|----------|----------|
| App (admin) | `admin` | `admin123` |
| pgAdmin | `admin@pgadmin.com` | `admin` |
| PostgreSQL | `hic_user` | `hic_password` |

---

## API Documentation

### Authentication

```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

**Login example**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

---

### Employees

```
GET    /api/employees?page=0&size=20
POST   /api/employees
GET    /api/employees/{id}
PUT    /api/employees/{id}
DELETE /api/employees/{id}
```

### Attendance

```
GET  /api/attendance/logs?employeeId=&from=&to=
GET  /api/attendance/summary?date=
POST /api/attendance/sync
```

### Leaves

```
GET    /api/leaves?status=PENDING
POST   /api/leaves
PUT    /api/leaves/{id}/approve
PUT    /api/leaves/{id}/reject
```

### Branches & Departments

```
GET  /api/branches
POST /api/branches
GET  /api/departments
POST /api/departments
```

### Devices

```
GET    /api/devices
POST   /api/devices
DELETE /api/devices/{id}
POST   /api/devices/{id}/sync
```

### Reports

```
GET /api/reports/attendance?from=&to=
GET /api/reports/leaves?year=
GET /api/reports/headcount
```

### Export

```
GET /api/export/attendance?format=excel&from=&to=
GET /api/export/employees?format=csv
```

---

## Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/dashboard` | Dashboard overview | All roles |
| `/employees` | Employee list & CRUD | ADMIN, HR |
| `/attendance` | Attendance logs | All roles |
| `/leaves` | Leave requests | All roles |
| `/reports` | Reports & export | ADMIN, HR |
| `/devices` | Hikvision device management | ADMIN |

---

## Development Setup (without Docker)

### Backend

```bash
# Start PostgreSQL locally (or point to a running instance)
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
```

Configure `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hic_central
spring.datasource.username=hic_user
spring.datasource.password=hic_password
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env     # edit VITE_API_URL if needed
npm run dev
# Dev server at http://localhost:5173
```

---

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and adjust:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend base URL |
| `VITE_APP_NAME` | `HR ERP System` | App display name |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused` on port 8080 | Ensure the backend container started; check `docker-compose logs backend` |
| Flyway migration error | Database may have stale schema – run `docker-compose down -v` to reset volumes |
| Frontend shows blank page | Check browser console; ensure `VITE_API_URL` points to the correct backend host |
| pgAdmin can't connect | Use hostname `postgres` (service name) inside Docker network |
| Hikvision sync fails | Verify device IP, port 80, and credentials; check firewall rules |

---

## Project Structure

```
HR_ERP/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/hic/
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── model/              # JPA entities
│   │   ├── repository/         # Spring Data repositories
│   │   ├── dto/                # Request / Response DTOs
│   │   ├── security/           # JWT + Spring Security config
│   │   └── util/               # Helpers (JWT, Excel, CSV, Hikvision)
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/       # Flyway SQL migrations
├── frontend/                   # React + TypeScript application
│   ├── src/
│   │   ├── api/                # Axios client & service functions
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Zustand state stores
│   │   └── types/              # TypeScript interfaces
│   ├── index.html
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## Contact & Support

For questions or support, open an issue in the [GitHub repository](https://github.com/AykhanCode/HR_ERP/issues).
