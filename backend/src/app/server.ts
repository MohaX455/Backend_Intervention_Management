import { createApp } from "./app.js";
import { env } from "../config/env/env.config.js";
import { initializeDatabase } from "../config/database/mysql.config.js";
import { logger } from "../shared/utils/logger.js";

const startServer = async (): Promise<void> => {
  await initializeDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

startServer();
