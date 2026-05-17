import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

export interface StoredFile {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export class StorageService {
  async save(file: Express.Multer.File): Promise<StoredFile> {
    await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
    const key = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const target = path.join(env.UPLOAD_DIR, key);
    await fs.rename(file.path, target);
    return { key, url: `/uploads/${key}`, originalName: file.originalname, mimeType: file.mimetype, size: file.size };
  }
}

export const storageService = new StorageService();
