import crypto from "crypto";

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString("hex");

export const generateTicketNumber = () => `CCH-SER-${crypto.randomInt(100000, 999999)}`;

export const generatePatientCode = () => `PAT-${crypto.randomInt(100000, 999999)}`;
