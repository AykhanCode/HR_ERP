-- V001__create_core_tables.sql
-- Core entities: Branch, Department, Position, Employee, User, WorkSchedule

CREATE TABLE branches (
    id                BIGSERIAL PRIMARY KEY,
    branch_name       VARCHAR(255) NOT NULL,
    branch_code       VARCHAR(50)  NOT NULL UNIQUE,
    location          VARCHAR(500),
    is_head_office    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_code ON branches (branch_code);

-- --------------------------------------------------------

CREATE TABLE departments (
    id               BIGSERIAL PRIMARY KEY,
    department_name  VARCHAR(255) NOT NULL,
    branch_id        BIGINT       NOT NULL REFERENCES branches (id),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_branch ON departments (branch_id);

-- --------------------------------------------------------

CREATE TABLE positions (
    id             BIGSERIAL PRIMARY KEY,
    position_name  VARCHAR(255) NOT NULL,
    department_id  BIGINT       NOT NULL REFERENCES departments (id),
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_positions_department ON positions (department_id);

-- --------------------------------------------------------

CREATE TABLE employees (
    id                 BIGSERIAL PRIMARY KEY,
    employee_id        VARCHAR(50)  NOT NULL UNIQUE,
    first_name         VARCHAR(150) NOT NULL,
    last_name          VARCHAR(150) NOT NULL,
    birth_date         DATE,
    gender             VARCHAR(10),
    mobile_phone       VARCHAR(30),
    email              VARCHAR(255),
    fin_number         VARCHAR(20)  UNIQUE,
    face_id            VARCHAR(100),
    card_id            VARCHAR(100),
    department_id      BIGINT       REFERENCES departments (id),
    position_id        BIGINT       REFERENCES positions (id),
    hire_date          DATE         NOT NULL DEFAULT CURRENT_DATE,
    employment_status  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                           CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_department   ON employees (department_id);
CREATE INDEX idx_employees_position     ON employees (position_id);
CREATE INDEX idx_employees_status       ON employees (employment_status);
CREATE INDEX idx_employees_fin          ON employees (fin_number);

-- --------------------------------------------------------

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    user_type       VARCHAR(20)  NOT NULL DEFAULT 'VIEWER'
                        CHECK (user_type IN ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'VIEWER')),
    branch_id       BIGINT       REFERENCES branches (id),
    department_id   BIGINT       REFERENCES departments (id),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_type     ON users (user_type);

-- --------------------------------------------------------

CREATE TABLE work_schedules (
    id                    BIGSERIAL PRIMARY KEY,
    employee_id           BIGINT       NOT NULL REFERENCES employees (id),
    effective_date        DATE         NOT NULL,
    end_date              DATE,
    monday_start          TIME,
    monday_end            TIME,
    tuesday_start         TIME,
    tuesday_end           TIME,
    wednesday_start       TIME,
    wednesday_end         TIME,
    thursday_start        TIME,
    thursday_end          TIME,
    friday_start          TIME,
    friday_end            TIME,
    saturday_start        TIME,
    saturday_end          TIME,
    sunday_start          TIME,
    sunday_end            TIME,
    daily_work_hours      DECIMAL(4, 2),
    grace_period_minutes  INTEGER      DEFAULT 0,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_schedules_employee       ON work_schedules (employee_id);
CREATE INDEX idx_work_schedules_effective_date ON work_schedules (effective_date);
