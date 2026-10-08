# Workspace Designer for monis.rent

An interactive tool for digital nomads and startups in Bali to **design their workspace visually and rent it**. Pick a desk, a chair, a monitor and some accessories, watch the room update as you go, then choose how long you want it and request the rental.

**Live demo:** _add your Vercel URL here_

## How it works

- **Live room preview.** Every item is an SVG placed in a fixed 1200×750 scene. Items are drawn to scale (1 SVG unit = 1 cm) and pinned by their bottom-centre to named slots: the desk sits on the floor, the monitor, keyboard, lamp and plant sit on whichever desk is chosen, and the chair and rug sit in front. Swapping the desk moves everything on it to the new desk height; items drop in, slide to new positions and fade out when removed.
- **Fits any screen.** The scene is scaled to fit the space above the picker and centred; the wall and floor are painted full-bleed behind it, so the room fills phones, tablets and wide monitors without distortion.
- **Picker.** One bottom dock on every screen size: category tabs (Desks, Chairs, Monitors, Accessories) with a row of selectable tiles, and the running monthly rent next to a "Rent this setup" button. Items that share a slot replace each other (e.g. 27in vs. 34in ultrawide); a desk is always required.
- **Rent flow (mocked).** The rent dialog lets you choose a rental length with a 1–12 month slider (5% off from 3 months, 10% from 6, 15% for 12), a delivery area in Bali, and your name and email. It shows a full price breakdown in IDR. Submitting simulates a request and confirms that payment instructions were emailed, with an option to start a new workspace.

## Tech choices

- **Next.js 16 (App Router) + React 19** — required; the page is a single client component tree rendered statically.
- **Tailwind CSS 4** — all styling is utility classes; no custom CSS files for the feature.
- **shadcn/ui (Base UI flavour)** — Button, Tabs, Dialog, Input, Label and Sonner toasts, all using the default shadcn theme tokens, so the room and UI follow the theme (light by default via `next-themes`).
- **tw-animate-css** — enter/exit animations for items in the room.
- **No state library.** The whole setup is a small `slot → item id` object; all rules (placement, toggling, pricing, rental quotes) are plain functions in `app/lib/room.ts`, which keeps the UI components thin and the logic easy to test.

## Project structure

```
app/
  lib/room.ts                 catalog, slots, placement, pricing and rental quote logic
  components/RoomScene.tsx    the scaled room and animated item layers
  components/RoomConfigurator.tsx  layout, header and the bottom dock
  components/ItemTile.tsx     selectable item tile
  components/RentDialog.tsx   rental form, price breakdown and mock confirmation
public/items/                 item SVGs
```

## Running locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## What I'd improve with more time

- **Shareable setups:** encode the setup in the URL so people can share or bookmark a design.
- **Richer catalog:** more items per category, colour/material variants, and real product photos from monis.rent.
- **More placement freedom:** drag items to reposition them, or place two monitors side by side.
- **Tests:** unit tests for `room.ts` (toggle rules, quotes) and a Playwright run through the rent flow on mobile and desktop.
- **Accessibility pass:** screen-reader announcements when the room changes, and a full keyboard-only walkthrough.
