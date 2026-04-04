-- Links each client record to the secretary (users.id) who created it.
-- Run once on your existing database.

-- Option A — Table `clients` is empty (or you can truncate in dev):
ALTER TABLE clients
ADD COLUMN created_by INT NOT NULL COMMENT 'users.id of the secretary who registered this client' AFTER address,
ADD CONSTRAINT fk_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- Option B — Table already has rows: add nullable, backfill, then enforce NOT NULL + FK
-- ALTER TABLE clients
-- ADD COLUMN created_by INT NULL COMMENT 'users.id of the secretary who registered this client' AFTER address;
--
-- Replace 1 below with a valid secretary user id from your `users` table (e.g. role secretary).
-- UPDATE clients SET created_by = 1 WHERE created_by IS NULL;
--
-- ALTER TABLE clients
-- MODIFY COLUMN created_by INT NOT NULL,
-- ADD CONSTRAINT fk_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id);
