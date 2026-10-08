import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, type Item } from "@/lib/room";

type Props = { item: Item; selected: boolean; onToggle: () => void; className?: string };

export default function ItemTile({ item, selected, onToggle, className }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border bg-card p-2.5 text-left text-sm transition-[border-color,box-shadow,background-color] outline-none",
        "hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/30",
        selected && "border-primary inset-ring inset-ring-primary",
        className
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-3" />
        </span>
      )}
      <div className="flex h-20 items-center justify-center rounded-xl bg-muted p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.src} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <div className="min-w-0 px-0.5">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-muted-foreground tabular-nums">
          {formatPrice(item.price)}
          <span className="text-xs">/mo</span>
        </p>
      </div>
    </button>
  );
}
