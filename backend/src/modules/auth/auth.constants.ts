import { CookieOptions } from "express";

export const AUTH_COOKIE_NAME = "token";
export const ROLE_COOKIE_NAME = "user_role";

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_DAY_IN_MS,
    path: "/",
};

export const ROLE_COOKIE_OPTIONS: CookieOptions = {
    ...DEFAULT_COOKIE_OPTIONS,
    httpOnly: false, // Allow frontend to read role for UI logic
};
