-- Table: reports
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    technician_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_intervention
        FOREIGN KEY (intervention_id) REFERENCES demandeInterventions(id),

    CONSTRAINT fk_report_technician
        FOREIGN KEY (technician_id) REFERENCES users(id)
);