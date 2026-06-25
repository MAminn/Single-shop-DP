import React, { useEffect, useState } from "react";
import { Tag, Zap, Truck, CheckCircle2 } from "lucide-react";
import { trpc } from "#root/shared/trpc/client";
import type { OfferCondition, OfferReward } from "#root/shared/database/drizzle/schema";

interface Props {
  cartSubtotal: number;
  cartQuantity: number;
  appliedOfferNames: string[];
  currency?: string;
}

interface ActiveOffer {
  id: string;
  name: string;
  condition: OfferCondition;
  reward: OfferReward;
  description?: string | null;
}

type BannerState =
  | { kind: "unlocked"; offer: ActiveOffer; rewardLabel: string; icon: "tag" | "truck" | "zap" }
  | { kind: "progress"; offer: ActiveOffer; progress: number; message: string; rewardLabel: string; icon: "tag" | "truck" | "zap" };

function getRewardLabel(reward: OfferReward): string {
  switch (reward.type) {
    case "percentage_off": return `${reward.percentOff}% off`;
    case "fixed_off": return `${reward.amountOff} off`;
    case "free_shipping": return "free shipping";
    case "free_items": return `${reward.quantity} item${reward.quantity > 1 ? "s" : ""} free`;
    default: return "a discount";
  }
}

function getIcon(reward: OfferReward): "tag" | "truck" | "zap" {
  if (reward.type === "free_shipping") return "truck";
  if (reward.type === "free_items") return "zap";
  return "tag";
}

function conditionProgress(
  offer: ActiveOffer,
  cartSubtotal: number,
  cartQuantity: number,
  currency: string,
): { met: true } | { met: false; progress: number; message: string } | null {
  const cond = offer.condition;

  if (cond.type === "quantity_threshold") {
    if (cartQuantity >= cond.minQuantity) return { met: true };
    const needed = cond.minQuantity - cartQuantity;
    const progress = Math.min(cartQuantity / cond.minQuantity, 0.99);
    return { met: false, progress, message: `Add ${needed} more item${needed === 1 ? "" : "s"} to unlock` };
  }

  if (cond.type === "cart_total") {
    if (cartSubtotal >= cond.minTotal) return { met: true };
    const needed = cond.minTotal - cartSubtotal;
    const progress = Math.min(cartSubtotal / cond.minTotal, 0.99);
    return { met: false, progress, message: `Spend ${needed.toFixed(2)} ${currency} more to unlock` };
  }

  // always / product_bundle — not progress-trackable
  return null;
}

export function OfferProgressBanner({ cartSubtotal, cartQuantity, appliedOfferNames, currency = "EGP" }: Props) {
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);

  useEffect(() => {
    trpc.offer.listActive.query()
      .then((res) => {
        if (res.success && res.result) setActiveOffers(res.result as ActiveOffer[]);
      })
      .catch(() => {});
  }, []);

  if (activeOffers.length === 0) return null;

  const bannerStates: BannerState[] = [];

  for (const offer of activeOffers) {
    const rewardLabel = getRewardLabel(offer.reward);
    const icon = getIcon(offer.reward);
    const prog = conditionProgress(offer, cartSubtotal, cartQuantity, currency);
    if (!prog) continue;

    if (prog.met) {
      // Offer condition is met — show as unlocked regardless of whether it's
      // in appliedOfferNames yet (it always should be, but be defensive)
      bannerStates.push({ kind: "unlocked", offer, rewardLabel, icon });
    } else if (!appliedOfferNames.includes(offer.name)) {
      bannerStates.push({ kind: "progress", offer, progress: prog.progress, message: prog.message, rewardLabel, icon });
    }
  }

  if (bannerStates.length === 0) return null;

  // Priority: show unlocked offers first, then the closest-to-unlocking pending one
  const unlocked = bannerStates.filter((s) => s.kind === "unlocked");
  const pending = bannerStates
    .filter((s): s is Extract<BannerState, { kind: "progress" }> => s.kind === "progress")
    .sort((a, b) => b.progress - a.progress);

  return (
    <div className="mb-6 space-y-2">
      {/* ── Unlocked offers ─────────────────────────────── */}
      {unlocked.map((state) => {
        if (state.kind !== "unlocked") return null;
        const IconComponent = state.icon === "truck" ? Truck : state.icon === "zap" ? Zap : Tag;
        return (
          <div key={state.offer.id} className="border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-emerald-800 leading-snug">
                🎉 <span className="font-bold">{state.offer.name}</span> unlocked!
              </p>
              <p className="text-[12px] text-emerald-700 mt-0.5">
                <strong>{state.rewardLabel}</strong> will be applied automatically at checkout.
              </p>
            </div>
            <span className="shrink-0 flex-col items-end hidden sm:flex">
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 font-semibold uppercase tracking-wide rounded">
                Active
              </span>
            </span>
          </div>
        );
      })}

      {/* ── Closest pending offer ────────────────────────── */}
      {pending.length > 0 && (() => {
        const top = pending[0]!;
        const IconComponent = top.icon === "truck" ? Truck : top.icon === "zap" ? Zap : Tag;
        return (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <IconComponent className="w-3.5 h-3.5 text-amber-600" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-amber-900 leading-snug">
                  {top.message}{" "}
                  <span className="text-amber-700">— get <strong>{top.rewardLabel}</strong>!</span>
                </p>
                <div className="mt-2 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(top.progress * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-amber-600">
                  {Math.round(top.progress * 100)}% of the way there
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
