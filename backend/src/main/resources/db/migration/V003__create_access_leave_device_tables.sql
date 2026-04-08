-- V003__create_access_leave_device_tables.sql
-- Leave, Access, Device tables: LeaveType, LeaveRequest, FaceData, AccessCard, DeviceConfig, DeviceSyncHistory

CREATE TABLE leave_types (
    id                 BIGSERIAL PRIMARY KEY,
    leave_code         VARCHAR(20)  NOT NULL UNIQUE,
    leave_name         VARCHAR(255) NOT NULL,
    annual_entitlement INTEGER,
    is_paid            BOOLEAN      DEFAULT TRUE,
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------

CREATE TABLE leave_requests (
    id             BIGSERIAL PRIMARY KEY,
    employee_id    BIGINT      NOT NULL REFERENCES employees (id),
    leave_type_id  BIGINT      NOT NULL REFERENCES leave_types (id),
    start_date     DATE        NOT NULL,
    end_date       DATE        NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by    BIGINT      REFERENCES users (id),
    approval_date  DATE,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_employee  ON leave_requests (employee_id);
CREATE INDEX idx_leave_requests_status    ON leave_requests (status);
CREATE INDEX idx_leave_requests_dates     ON leave_requests (start_date, end_date);

-- --------------------------------------------------------

CREATE TABLE face_data (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT       NOT NULL UNIQUE REFERENCES employees (id),
    face_vector  TEXT,
    device_id    VARCHAR(100),
    enrolled_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------

CREATE TABLE access_cards (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT       NOT NULL REFERENCES employees (id),
    card_number  VARCHAR(100) NOT NULL UNIQUE,
    issued_date  DATE,
    expiry_date  DATE,
    is_active    BOOLEAN      DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_cards_employee    ON access_cards (employee_id);
CREATE INDEX idx_access_cards_card_number ON access_cards (card_number);

-- --------------------------------------------------------

CREATE TABLE device_configs (
    id                  BIGSERIAL PRIMARY KEY,
    device_id           VARCHAR(100) NOT NULL UNIQUE,
    device_name         VARCHAR(255),
    device_ip           VARCHAR(100) NOT NULL,
    device_port         INTEGER      DEFAULT 80,
    username            VARCHAR(100),
    password_encrypted  VARCHAR(500),
    branch_id           BIGINT       REFERENCES branches (id),
    status              VARCHAR(20)  DEFAULT 'ACTIVE',
    last_sync_time      TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_configs_branch ON device_configs (branch_id);
CREATE INDEX idx_device_configs_status ON device_configs (status);

-- --------------------------------------------------------

CREATE TABLE device_sync_histories (
    id               BIGSERIAL PRIMARY KEY,
    device_id        VARCHAR(100) NOT NULL,
    sync_start_time  TIMESTAMP,
    sync_end_time    TIMESTAMP,
    records_synced   INTEGER      DEFAULT 0,
    sync_status      VARCHAR(20)  CHECK (sync_status IN ('SUCCESS', 'FAILED')),
    error_message    TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_sync_history_device     ON device_sync_histories (device_id);
CREATE INDEX idx_device_sync_history_created_at ON device_sync_histories (created_at DESC);
