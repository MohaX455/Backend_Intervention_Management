-- Table: technician_profile
CREATE TABLE technician_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id INT NOT NULL UNIQUE,
    experience_years INT NOT NULL,
    skills TEXT,
    phone VARCHAR(20),
    availability BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_technician_user FOREIGN KEY (technician_id) REFERENCES users(id)
);
