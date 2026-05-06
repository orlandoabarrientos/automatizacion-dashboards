import { promises as fs } from "fs";
import path from "path";
import type { InventorySnapshot } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SNAPSHOT_PATH = path.join(DATA_DIR, "inventory-snapshot.json");

export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function saveInventorySnapshot(snapshot: InventorySnapshot): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf-8");
}

export async function loadInventorySnapshot(): Promise<InventorySnapshot | null> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as InventorySnapshot;
    if (
      parsed &&
      Array.isArray(parsed.inventoryMaster) &&
      Array.isArray(parsed.inventoryMovements) &&
      typeof parsed.receivedAt === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
