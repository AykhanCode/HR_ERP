-- V002__create_attendance_tables.sql
-- Attendance tracking: AttendanceLog, DailyAttendanceSummary

CREATE TABLE attendance_logs (
    id                   BIGSERIAL PRIMARY KEY,
    employee_id          BIGINT       NOT NULL REFERENCES employees (id),
    check_in_time        TIMESTAMP,
    check_out_time       TIMESTAMP,
    device_id            VARCHAR(100),
    door_id              VARCHAR(100),
    event_type           VARCHAR(50),
    verification_method  VARCHAR(50),
    status               VARCHAR(20)  DEFAULT 'ACTIVE',
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_logs_employee       ON attendance_logs (employee_id);
CREATE INDEX idx_attendance_logs_check_in_time  ON attendance_logs (check_in_time);
CREATE INDEX idx_attendance_logs_device         ON attendance_logs (device_id);

-- --------------------------------------------------------

CREATE TABLE daily_attendance_summaries (
    id                BIGSERIAL PRIMARY KEY,
    employee_id       BIGINT      NOT NULL REFERENCES employees (id),
    attendance_date   DATE        NOT NULL,
    check_in_time     TIMESTAMP,
    check_out_time    TIMESTAMP,
    hours_worked      DECIMAL(5, 2),
    is_standard_day   BOOLEAN     DEFAULT TRUE,
    is_additional_day BOOLEAN     DEFAULT FALSE,
    is_extra_day      BOOLEAN     DEFAULT FALSE,
    is_holiday        BOOLEAN     DEFAULT FALSE,
    is_leave          BOOLEAN     DEFAULT FALSE,
    attendance_status VARCHAR(20) CHECK (attendance_status IN
                          ('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'ON_LEAVE')),
    created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_summary UNIQUE (employee_id, attendance_date)
);

CREATE INDEX idx_daily_summary_employee ON daily_attendance_summaries (employee_id);
CREATE INDEX idx_daily_summary_date     ON daily_attendance_summaries (attendance_date);
CREATE INDEX idx_daily_summary_status   ON daily_attendance_summaries (attendance_status);
