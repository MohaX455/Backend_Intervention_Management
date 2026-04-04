-- Table: clients (reference schema; align with your live DB + migrations)
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    client_type ENUM('individual', 'company') NOT NULL DEFAULT 'individual',
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    created_by INT NOT NULL COMMENT 'Secretary (users.id) who created this client',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);