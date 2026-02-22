-- Table: interventions
CREATE TABLE interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    created_by INT NOT NULL,
    assigned_to INT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'created',
    priority VARCHAR(20) DEFAULT 'normal',
    intervention_address TEXT NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_intervention_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_intervention_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_intervention_technician FOREIGN KEY (assigned_to) REFERENCES users(id)
);