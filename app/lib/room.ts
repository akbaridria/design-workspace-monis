// lib/room.ts — data + placement math (no React). 1 SVG unit = 1 cm.

export const PPC = 4.5; // px per cm in the 1200x750 scene. Change once, everything scales.
export const SCENE = { w: 1200, h: 750, floorY: 620, centerX: 520 };

export type SlotId = "desk" | "chair" | "monitor" | "keyboard" | "lamp" | "plant" | "rug";

export type Category = "desks" | "chairs" | "monitors" | "accessories";

export type Item = {
  id: string;
  name: string;
  src: string;        // file in /public/items
  widthCm: number;    // = SVG viewBox width (SVGs are cropped tight, bottom edge on the surface)
  heightCm: number;   // = SVG viewBox height
  slot: SlotId;       // items sharing a slot replace each other
  category: Category;
  price: number;      // monthly rent in IDR, whole rupiah
  flat?: boolean;     // lies on a surface (no drop shadow)
};

export type Setup = Partial<Record<SlotId, string>>; // slot -> item id

export const CATALOG: Item[] = [
  { id: "desk-electric-140", name: "Electric standing desk", src: "/items/desk-electric-140.svg", widthCm: 140, heightCm: 75,   slot: "desk",     category: "desks",       price: 650_000 },
  { id: "desk-oak-120",      name: "Oak desk 120",      src: "/items/desk-oak-120.svg",      widthCm: 120, heightCm: 72,   slot: "desk",     category: "desks",       price: 400_000 },
  { id: "chair-ergo",        name: "Ergonomic mesh chair", src: "/items/chair-ergo.svg",     widthCm: 66,  heightCm: 115,  slot: "chair",    category: "chairs",      price: 450_000 },
  { id: "chair-wood",        name: "Wood chair",        src: "/items/chair-wood.svg",        widthCm: 45,  heightCm: 85,   slot: "chair",    category: "chairs",      price: 150_000 },
  { id: "monitor-27",        name: "27in 4K monitor",   src: "/items/monitor-27.svg",        widthCm: 61,  heightCm: 43.5, slot: "monitor",  category: "monitors",    price: 350_000 },
  { id: "monitor-ultrawide-34", name: "34in ultrawide", src: "/items/monitor-ultrawide-34.svg", widthCm: 81, heightCm: 42.5, slot: "monitor", category: "monitors",   price: 600_000 },
  { id: "keyboard",          name: "Wireless keyboard", src: "/items/keyboard.svg",          widthCm: 44,  heightCm: 4,    slot: "keyboard", category: "accessories", price: 75_000, flat: true },
  { id: "lamp",              name: "Desk lamp",         src: "/items/lamp.svg",              widthCm: 26,  heightCm: 44,   slot: "lamp",     category: "accessories", price: 75_000 },
  { id: "plant",             name: "Plant",             src: "/items/plant.svg",             widthCm: 30,  heightCm: 48,   slot: "plant",    category: "accessories", price: 50_000 },
  { id: "rug",               name: "Woven rug",         src: "/items/rug.svg",               widthCm: 160, heightCm: 14,   slot: "rug",      category: "accessories", price: 100_000, flat: true },
];

export const CATEGORIES: { id: Category; label: string; required?: boolean }[] = [
  { id: "desks", label: "Desks", required: true },
  { id: "chairs", label: "Chairs" },
  { id: "monitors", label: "Monitors" },
  { id: "accessories", label: "Accessories" },
];

export const byId = (id?: string) => CATALOG.find((i) => i.id === id);

/** Slots are named points. Desk-top slots are derived from the selected desk. */
type Desk = { wCm: number; topY: number };
export const SLOTS: Record<SlotId, { z: number; at: (d: Desk) => [number, number] }> = {
  desk:    { z: 10, at: () => [SCENE.centerX, SCENE.floorY] },
  monitor:  { z: 20, at: (d) => [SCENE.centerX, d.topY] },
  keyboard: { z: 22, at: (d) => [SCENE.centerX, d.topY] },
  lamp:     { z: 15, at: (d) => [SCENE.centerX + (d.wCm / 2 - 12) * PPC, d.topY] },
  plant:    { z: 18, at: (d) => [SCENE.centerX - (d.wCm / 2 - 11) * PPC, d.topY] },
  rug:      { z: 5,  at: () => [SCENE.centerX + 120, SCENE.floorY + 70] },
  chair:    { z: 30, at: () => [SCENE.centerX + 340, SCENE.floorY + 40] },
};

function deskOf(setup: Setup): Desk {
  const d = byId(setup.desk) ?? CATALOG[0];
  return { wCm: d.widthCm, topY: SCENE.floorY - d.heightCm * PPC };
}

/** Item + slot -> bottom-centre point and width in scene px. Height follows the SVG's aspect ratio. */
export function place(item: Item, slot: SlotId, setup: Setup) {
  const [x, y] = SLOTS[slot].at(deskOf(setup));
  return { x, y, w: item.widthCm * PPC, z: SLOTS[slot].z };
}

/** Click on an item -> next setup. Picking an item replaces whatever was in its slot; clicking it again removes it. */
export function toggle(setup: Setup, item: Item): Setup {
  const next = { ...setup };
  if (item.slot === "desk") next.desk = item.id; // a desk is always present
  else if (next[item.slot] === item.id) delete next[item.slot];
  else next[item.slot] = item.id;
  return next;
}

export const isSelected = (setup: Setup, item: Item) => setup[item.slot] === item.id;

export const DEFAULT_SETUP: Setup = {
  desk: "desk-electric-140", chair: "chair-ergo", monitor: "monitor-27", keyboard: "keyboard", lamp: "lamp", plant: "plant",
};

/** Selected items, in SLOTS order. */
export function lineItems(setup: Setup) {
  return (Object.keys(SLOTS) as SlotId[]).flatMap((slot) => {
    const item = byId(setup[slot]);
    return item ? [{ slot, item }] : [];
  });
}

export const total = (setup: Setup, category?: Category) =>
  lineItems(setup)
    .filter((l) => !category || l.item.category === category)
    .reduce((sum, l) => sum + l.item.price, 0);

export const RENTAL_MONTHS = { min: 1, max: 12 } as const;

/** Longer rentals get a lower monthly rate: from N months on, this discount applies. Highest tier first. */
export const RENTAL_DISCOUNTS = [
  { fromMonths: 12, discount: 0.15 },
  { fromMonths: 6, discount: 0.1 },
  { fromMonths: 3, discount: 0.05 },
] as const;

export const discountFor = (months: number) => RENTAL_DISCOUNTS.find((t) => months >= t.fromMonths)?.discount ?? 0;

export function rentalQuote(setup: Setup, months: number) {
  const monthly = total(setup);
  const discount = discountFor(months);
  const perMonth = Math.round(monthly * (1 - discount));
  return { monthly, perMonth, discount, months, total: perMonth * months, saved: (monthly - perMonth) * months };
}

export const DELIVERY_AREAS = ["Canggu", "Seminyak", "Ubud", "Uluwatu", "Sanur", "Denpasar"] as const;

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
export const formatPrice = (rupiah: number) => idr.format(rupiah);
