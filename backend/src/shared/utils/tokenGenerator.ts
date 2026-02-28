import crypto from "crypto";

export const generateToken = (size = 32) => {
    return crypto.randomBytes(size).toString("hex");
};