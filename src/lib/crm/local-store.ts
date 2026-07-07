import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = ".data";

export function dataPath(file: string) {
  return path.join(process.cwd(), DATA_DIR, file);
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(dataPath(file), "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Unable to read ${file}:`, err);
    }
    return fallback;
  }
}

export async function writeJsonFile(file: string, value: unknown) {
  await fs.mkdir(path.join(process.cwd(), DATA_DIR), { recursive: true });
  await fs.writeFile(dataPath(file), JSON.stringify(value, null, 2), "utf8");
}

export async function appendJsonlFile(file: string, value: unknown) {
  await fs.mkdir(path.join(process.cwd(), DATA_DIR), { recursive: true });
  await fs.appendFile(dataPath(file), `${JSON.stringify(value)}\n`, "utf8");
}
