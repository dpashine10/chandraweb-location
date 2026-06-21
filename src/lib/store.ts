import fs from "fs";
import path from "path";

import type { MenuItem } from "./menu-types";

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "menu.json"
);

function loadMenu(): MenuItem[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(
      `[store] Failed to parse ${DATA_FILE} — it isn't valid JSON. ` +
      `Returning an empty menu instead of crashing. This file is the only ` +
      `copy of your menu data now, so fix the JSON by hand or restore it ` +
      `from a backup / git history.`,
      err
    );
    return [];
  }
}

function saveMenu(
  items: MenuItem[]
): void {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(items, null, 2),
    "utf8"
  );
}

export function getAllItems(): MenuItem[] {
  return loadMenu();
}

export function getAvailableItems(): MenuItem[] {
  return loadMenu().filter(
    (item) => item.available
  );
}

export function addItem(
  item: MenuItem
): MenuItem {
  const items = loadMenu();

  items.push(item);

  saveMenu(items);

  return item;
}

export function updateItem(
  id: string,
  updates: Partial<MenuItem>
): MenuItem | null {
  const items = loadMenu();

  const index = items.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...updates,
    id,
  };

  saveMenu(items);

  return items[index];
}

export function deleteItem(
  id: string
): boolean {
  const items = loadMenu();

  const filtered = items.filter(
    (item) => item.id !== id
  );

  if (filtered.length === items.length) {
    return false;
  }

  saveMenu(filtered);

  return true;
}