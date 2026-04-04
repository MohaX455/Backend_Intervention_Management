CREATE TABLE IF NOT EXISTS interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demande_id INT NOT NULL,
    technicien_id INT NULL, -- ⚠️ doit accepter NULL
    
    date_start TIMESTAMP NULL,
    date_end TIMESTAMP NULL,
    
    statut ENUM('planned', 'in_progress', 'completed', 'cancelled') 
        NOT NULL DEFAULT 'planned',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_demande 
        FOREIGN KEY (demande_id) 
        REFERENCES demandeInterventions(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,

    CONSTRAINT fk_technicien 
        FOREIGN KEY (technicien_id) 
        REFERENCES techniciens(id)
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);