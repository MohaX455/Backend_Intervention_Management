-- Table: demandeInterventions

DROP TABLE IF EXISTS interventions;

CREATE TABLE IF NOT EXISTS demandeInterventions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    client_id INT NOT NULL,
    created_by INT NOT NULL DEFAULT 1,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    status ENUM(
        'created',
        'validated',
        'cancelled'
    ) NOT NULL DEFAULT 'created',

    priority ENUM(
        'low',
        'normal',
        'high',
        'urgent'
    ) NOT NULL DEFAULT 'normal',

    intervention_address TEXT NOT NULL,

    latitude DECIMAL(9,6) NULL,
    longitude DECIMAL(9,6) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);