import {
  Award,
  Headphones,
  RefreshCw,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type {
  HomepageValuePropsContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

// Icon mapping — same picker values the existing templates map
// (reference: LandingTemplateModern ICON_MAP, replicated read-only)
const ICON_MAP: Record<
  ValuePropIconType,
  React.ComponentType<{ className?: string }>
> = {
  shopping: ShoppingBag,
  shipping: Truck,
  security: Shield,
  support: Headphones,
  quality: Award,
  returns: RefreshCw,
};

interface NoirBenefitsStripProps {
  valueProps: HomepageValuePropsContent;
}

/**
 * NoirBenefitsStrip — horizontal band of icon + bold micro-label +
 * 2-line subtext items, mapped from the CMS valuePropositions items.
 * Renders nothing when disabled or empty.
 */
export function NoirBenefitsStrip({ valueProps }: NoirBenefitsStripProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.18em]";

  if (!valueProps.enabled || valueProps.items.length === 0) return null;

  return (
    <section className='px-4 md:px-8 py-10 md:py-14'>
      <div className='mx-auto max-w-7xl border-y border-white/10 py-8 md:py-10'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6'>
          {valueProps.items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? ShoppingBag;
            return (
              <div
                key={`${item.icon}-${item.title}`}
                className='flex flex-col items-center text-center gap-3 px-2'>
                <Icon className='w-6 h-6 text-[#E8112D]' />
                <h3
                  className={cn(
                    "text-[11px] uppercase font-semibold text-white",
                    track,
                    NOIR_DISPLAY_FONT_CLASSES,
                  )}>
                  {item.title}
                </h3>
                {item.description && (
                  <p
                    className={cn(
                      "text-xs leading-relaxed line-clamp-2 max-w-55",
                      NOIR_TEXT_SECONDARY_CLASSES,
                    )}>
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
