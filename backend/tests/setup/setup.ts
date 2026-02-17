import { beforeEach } from "vitest";
import { resetDatabase } from "./testDatabase";

beforeEach(async () => {
  await resetDatabase();
});
