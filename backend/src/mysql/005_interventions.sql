-- Table: interventions

CREATE TABLE IF NOT EXISTS interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    client_id INT NOT NULL,
    created_by INT NOT NULL,
    assigned_to INT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    status ENUM(
        'created',
        'assigned',
        'in_progress',
        'completed',
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

    scheduled_start DATETIME NULL,
    scheduled_end DATETIME NULL,

    started_at DATETIME NULL,
    completed_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);