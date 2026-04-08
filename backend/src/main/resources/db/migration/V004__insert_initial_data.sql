-- V004__insert_initial_data.sql
-- Seed data: admin user, Azerbaijan public leave types

-- Head-office branch (required before users that reference it)
INSERT INTO branches (branch_name, branch_code, location, is_head_office)
VALUES ('Head Office', 'HQ', 'Baku, Azerbaijan', TRUE);

-- HR department in head office
INSERT INTO departments (department_name, branch_id)
VALUES ('Human Resources', 1);

-- Admin user (password: admin123  ->  BCrypt hash)
INSERT INTO users (username, password_hash, email, user_type, branch_id, is_active)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin@hic.az',
    'SUPER_ADMIN',
    1,
    TRUE
);

-- --------------------------------------------------------
-- Azerbaijan statutory leave types (Labour Code of the Republic of Azerbaijan)
-- --------------------------------------------------------

INSERT INTO leave_types (leave_code, leave_name, annual_entitlement, is_paid) VALUES
    ('ANNUAL',      'İllik Məzuniyyət (Annual Leave)',                      21, TRUE),
    ('EXTRA',       'Əlavə Məzuniyyət (Additional Annual Leave)',            6, TRUE),
    ('SICK',        'Xəstəlik Məzuniyyəti (Sick Leave)',                    14, TRUE),
    ('MATERNITY',   'Doğuşla Bağlı Məzuniyyət (Maternity Leave)',          126, TRUE),
    ('PATERNITY',   'Ata Məzuniyyəti (Paternity Leave)',                    14, TRUE),
    ('CHILDCARE',   'Uşağa Qulluq Məzuniyyəti (Childcare Leave)',         1095, TRUE),
    ('STUDY',       'Təhsil Məzuniyyəti (Study Leave)',                     30, TRUE),
    ('UNPAID',      'Ödənişsiz Məzuniyyət (Unpaid Leave)',                  NULL, FALSE),
    ('BEREAVEMENT', 'Matəm Məzuniyyəti (Bereavement Leave)',                5, TRUE),
    ('MARRIAGE',    'Nikah Məzuniyyəti (Marriage Leave)',                   3, TRUE),
    ('DISABILITY',  'Əlillik Məzuniyyəti (Disability Leave)',               60, TRUE),
    ('SOCIAL',      'Sosial Məzuniyyət (Social Leave)',                     NULL, TRUE);
