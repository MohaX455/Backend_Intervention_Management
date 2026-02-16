import { RowDataPacket } from "mysql2";

export type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password: string;
  role_id: number;
};

export type LoginResponse = {
  roleId: number;
};
