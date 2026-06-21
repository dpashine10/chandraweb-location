import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getAllItems, getAvailableItems, addItem, updateItem, deleteItem } from "@/lib/store";
import { MenuItem } from "@/lib/menu-types";

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === "admin";
}

// Public: get available items only
// Admin: get all items
export async function GET(req: NextRequest) {
  const admin = isAdmin(req);
  const items = admin ? getAllItems() : getAvailableItems();
  return NextResponse.json(items);
}

// Admin only: add item
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  let body: Partial<MenuItem>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, category, price, dietType, description, available } = body;
  if (!name || !category || !price || !dietType) {
    return NextResponse.json({ error: "name, category, price and dietType are required" }, { status: 400 });
  }

  const newItem: MenuItem = {
    id: `${category.slice(0, 2).toLowerCase()}${Date.now()}`,
    name: name.trim(),
    category: category.trim(),
    price: price.trim(),
    dietType,
    description: description?.trim() ?? "",
    available: available ?? true,
  };

  addItem(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

// Admin only: update item
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  let body: Partial<MenuItem> & { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = updateItem(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// Admin only: delete item
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }
  const ok = deleteItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
