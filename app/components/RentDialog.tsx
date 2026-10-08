"use client";
import { useState, type FormEvent } from "react";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DELIVERY_AREAS,
  RENTAL_MONTHS,
  formatPrice,
  lineItems,
  rentalQuote,
  type Setup,
} from "@/lib/room";

type Status = "form" | "submitting" | "sent";

type Props = { setup: Setup; onNewWorkspace: () => void; className?: string };

export default function RentDialog({ setup, onNewWorkspace, className }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("form");
  const [months, setMonths] = useState(3);
  const [area, setArea] = useState<string>(DELIVERY_AREAS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const lines = lineItems(setup);
  const quote = rentalQuote(setup, months);

  function onOpenChange(next: boolean) {
    if (status === "submitting") return;
    if (next) setStatus("form");
    setOpen(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 1200)); // mock rental request
    setStatus("sent");
    toast.success("Rental request sent", { description: `Payment instructions are on their way to ${email}.` });
  }

  function newWorkspace() {
    onNewWorkspace();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size="lg" className={className} disabled={!lines.length} />}>
        Rent this setup
      </DialogTrigger>
      <DialogContent showCloseButton={status !== "submitting"} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {status === "sent" ? (
          <>
            <DialogHeader className="items-center text-center">
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
                <MailCheckIcon className="size-6" />
              </div>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We&apos;ve sent instructions on how to pay {formatPrice(quote.total)} to <span className="font-medium text-foreground">{email}</span>.
                Once it&apos;s paid, we&apos;ll deliver and set up your workspace in {area}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" size="lg" onClick={newWorkspace}>
                Create another workspace
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="contents">
            <DialogHeader>
              <DialogTitle>Rent this setup</DialogTitle>
              <DialogDescription>We deliver and set it up anywhere in Bali. Longer rentals get a lower monthly rate.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <Label id="rent-months-label">Rental length</Label>
                <span className="text-sm font-medium tabular-nums">
                  {months} month{months === 1 ? "" : "s"}
                  {quote.discount > 0 && <span className="text-muted-foreground"> · −{quote.discount * 100}%</span>}
                </span>
              </div>
              <Slider
                min={RENTAL_MONTHS.min}
                max={RENTAL_MONTHS.max}
                step={1}
                value={[months]}
                onValueChange={(v) => setMonths(Array.isArray(v) ? v[0] : v)}
                disabled={status === "submitting"}
                aria-labelledby="rent-months-label"
              />
            </div>

            <fieldset className="flex flex-col gap-2" disabled={status === "submitting"}>
              <legend className="mb-2 text-sm font-medium">Delivery area</legend>
              <div className="grid grid-cols-3 gap-2">
                {DELIVERY_AREAS.map((a) => (
                  <Button
                    key={a}
                    type="button"
                    size="sm"
                    variant={area === a ? "default" : "outline"}
                    aria-pressed={area === a}
                    onClick={() => setArea(a)}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2" disabled={status === "submitting"}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rent-name">Name</Label>
                <Input id="rent-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rent-email">Email</Label>
                <Input id="rent-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </fieldset>

            <div className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-4">
              <ul className="flex flex-col gap-1.5">
                {lines.map(({ slot, item }) => (
                  <li key={slot} className="flex justify-between gap-3">
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">{formatPrice(item.price)}/mo</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-col gap-1.5 border-t pt-3">
                {quote.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{quote.discount * 100}% off for {months} months</span>
                    <span className="tabular-nums">−{formatPrice(quote.saved)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Monthly rent</span>
                  <span className="tabular-nums">{formatPrice(quote.perMonth)}/mo</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total for {months} month{months === 1 ? "" : "s"}</span>
                  <span className="tabular-nums">{formatPrice(quote.total)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" size="lg" disabled={status === "submitting"}>
                {status === "submitting" && <Loader2Icon className="animate-spin" />}
                {status === "submitting" ? "Sending request…" : `Request rental · ${formatPrice(quote.total)}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
