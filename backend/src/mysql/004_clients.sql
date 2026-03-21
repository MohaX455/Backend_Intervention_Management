-- Table: clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);