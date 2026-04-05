-- Table: technician_profiles
DROP TABLE IF EXISTS technician_profiles;

CREATE TABLE technician_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    technician_id INT NOT NULL UNIQUE,

    speciality VARCHAR(150) NOT NULL, -- spécialité principale (ex: Electrician, HVAC, Network)

    phone VARCHAR(20) NULL,

    availability BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_technician_user 
        FOREIGN KEY (technician_id) 
        REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);