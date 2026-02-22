-- Table: logs (audit / historique)
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    old_value JSON,
    new_value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);