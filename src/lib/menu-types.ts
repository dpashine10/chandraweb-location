// Type-only file — erased entirely at compile time, never read while the
// app is running. The actual menu data lives in data/menu.json and is
// read/written only by src/lib/store.ts + the /api/admin/menu route.
// This file exists purely so TypeScript can check the shape of an item;
// it has no runtime presence and is never touched by the admin dashboard.

export type DietType = "VEG" | "EGG" | "NON-VEG";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: string;
  description: string;
  dietType: DietType;
  available: boolean;
}
