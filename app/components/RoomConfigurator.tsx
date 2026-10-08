"use client";
import { useState } from "react";
import RoomScene from "./RoomScene";
import ItemTile from "./ItemTile";
import RentDialog from "./RentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATALOG,
  CATEGORIES,
  DEFAULT_SETUP,
  formatPrice,
  isSelected,
  lineItems,
  toggle,
  total,
  type Item,
  type Setup,
} from "@/lib/room";

export default function RoomConfigurator() {
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP);
  const count = lineItems(setup).length;

  return (
    <div className="flex h-full flex-col text-foreground">
      <div className="relative min-h-0 flex-1">
        <RoomScene setup={setup} />
        <header className="pointer-events-none absolute inset-x-0 top-0 flex p-3 lg:p-4">
          <div className="rounded-3xl border bg-background/80 px-4 py-2 shadow-sm backdrop-blur-md">
            <p className="text-sm font-semibold">
              monis<span className="text-muted-foreground">.rent</span>
            </p>
            <p className="text-xs text-muted-foreground">Design your Bali workspace, then rent it.</p>
          </div>
        </header>
      </div>

      {/* bg matches the room's floor colour so the floor continues behind the dock */}
      <div className="shrink-0 bg-border lg:px-4 lg:pb-4">
        <section className="mx-auto flex w-full flex-col gap-3 rounded-t-4xl border-t bg-background px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.15)] lg:max-w-4xl lg:flex-row lg:items-stretch lg:gap-6 lg:rounded-4xl lg:border lg:p-4 lg:shadow-lg">
          <Tabs defaultValue="desks" className="min-w-0 lg:flex-1">
            <TabsList className="w-full justify-start overflow-x-auto lg:w-fit">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((c) => (
              <TabsContent key={c.id} value={c.id}>
                <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1">
                  {CATALOG.filter((item) => item.category === c.id).map((item: Item) => (
                    <ItemTile
                      key={item.id}
                      item={item}
                      selected={isSelected(setup, item)}
                      onToggle={() => setSetup((s) => toggle(s, item))}
                      className="w-40 shrink-0 snap-start lg:w-36"
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* desktop: label row lines up with the tabs, button bottom lines up with the tiles */}
          <div className="flex items-center justify-between gap-4 border-t pt-3 lg:w-60 lg:shrink-0 lg:flex-col lg:items-stretch lg:border-t-0 lg:border-l lg:pt-0 lg:pb-1 lg:pl-6">
            <div>
              <p className="text-sm text-muted-foreground lg:flex lg:h-9 lg:items-center">
                Monthly rent · {count} item{count === 1 ? "" : "s"}
              </p>
              <p className="text-lg font-semibold tabular-nums lg:mt-2 lg:text-2xl">
                {formatPrice(total(setup))}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
            <RentDialog setup={setup} onNewWorkspace={() => setSetup(DEFAULT_SETUP)} className="lg:w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
