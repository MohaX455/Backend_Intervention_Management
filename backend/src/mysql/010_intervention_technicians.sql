-- Table: intervention_technicians
DROP TABLE IF EXISTS intervention_technicians;
CREATE TABLE IF NOT EXISTS intervention_technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    technician_id INT NOT NULL,
    role ENUM('lead', 'support') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_intervention_technicians_intervention FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_intervention_technicians_technician FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);