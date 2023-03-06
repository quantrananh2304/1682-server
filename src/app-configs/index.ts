/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: `.env` });

export const NODE_ENV = process.env.NODE_ENV || "undefind";
export const PORT = Number(process.env.PORT || 443);
export const MONGO_DB_URI = process.env.MONGO_DB_URI || "";
export const SOURCE = process.env.SOURCE || "";
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD || "";
export const RANDOM_TOKEN_SECRET =
  process.env.RANDOM_TOKEN_SECRET || "RANDOM_TOKEN_SECRET";
