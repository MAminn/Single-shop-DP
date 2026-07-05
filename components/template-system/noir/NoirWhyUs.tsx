import {
  Award,
  Headphones,
  RefreshCw,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type {
  HomepageBrandStatementContent,
  HomepageValuePropsContent,
  ValuePropIconType,
  ValuePropItem,
} from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

// Same icon-picker mapping as NoirBenefitsStrip (LandingTemplateModern reference)
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

interface NoirWhyUsProps {
  brandStatement: HomepageBrandStatementContent;
  valueProps: HomepageValuePropsContent;
}

function BenefitItem({
  item,
  align,
}: {
  item: ValuePropItem;
  align: "start" | "end" | "center";
}) {
  const Icon = ICON_MAP[item.icon] ?? ShoppingBag;
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "end" && "md:items-end md:text-end",
        align === "start" && "md:items-start md:text-start",
        "items-center text-center",
      )}>
      <Icon className='w-5 h-5 text-[#E8112D]' />
      <h4
        className={cn(
          "text-[11px] uppercase font-semibold text-white tracking-normal",
          NOIR_DISPLAY_FONT_CLASSES,
        )}>
        {item.title}
      </h4>
      {item.description && (
        <p
          className={cn(
            "text-xs leading-relaxed max-w-55",
            NOIR_TEXT_SECONDARY_CLASSES,
          )}>
          {item.description}
        </p>
      )}
    </div>
  );
}

/**
 * NoirWhyUs — brand statement centerpiece. CMS brandStatement
 * title/description/image rendered as a centered image with benefit
 * items (valuePropositions data, same source as NoirBenefitsStrip)
 * radiating left/right on desktop, stacked on mobile. With fewer than
 * 4 items (or no image) a simpler two-column layout renders instead.
 * Never invents items; renders nothing when disabled.
 */
export function NoirWhyUs({ brandStatement, valueProps }: NoirWhyUsProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.14em]";

  if (!brandStatement.enabled) return null;

  const items = valueProps.enabled ? valueProps.items : [];
  const hasImage = Boolean(brandStatement.image);
  const useRadiating = hasImage && items.length >= 4;

  const header = (
    <div className='text-center space-y-4 mb-10 md:mb-14'>
      <div className='w-12 h-0.5 bg-[#E8112D] mx-auto' aria-hidden='true' />
      <h2
        className={cn(
          "text-2xl md:text-4xl uppercase font-semibold text-white max-w-2xl mx-auto",
          track,
          NOIR_DISPLAY_FONT_CLASSES,
        )}>
        {brandStatement.title}
      </h2>
      {brandStatement.description && (
        <p
          className={cn(
            "text-sm md:text-base leading-relaxed max-w-xl mx-auto",
            NOIR_TEXT_SECONDARY_CLASSES,
          )}>
          {brandStatement.description}
        </p>
      )}
    </div>
  );

  return (
    <section className='px-4 md:px-8 py-12 md:py-20'>
      <div className='mx-auto max-w-7xl'>
        {header}

        {useRadiating ? (
          /* ── Centered image, 2 items each side on desktop ── */
          <div className='grid md:grid-cols-[1fr_auto_1fr] items-center gap-10 md:gap-12'>
            <div className='flex flex-col gap-10 order-2 md:order-1'>
              {items.slice(0, 2).map((item) => (
                <BenefitItem
                  key={`${item.icon}-${item.title}`}
                  item={item}
                  align='end'
                />
              ))}
            </div>
            <div className='order-1 md:order-2 mx-auto'>
              <div className='w-64 md:w-80 aspect-3/4 bg-[#101010] border border-white/10 rounded-xl overflow-hidden'>
                <img
                  src={brandStatement.image}
                  alt={brandStatement.title}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
              </div>
            </div>
            <div className='flex flex-col gap-10 order-3'>
              {items.slice(2, 4).map((item) => (
                <BenefitItem
                  key={`${item.icon}-${item.title}`}
                  item={item}
                  align='start'
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Simpler layout: optional image + items in two columns ── */
          <div
            className={cn(
              "grid gap-10 items-center",
              hasImage && "md:grid-cols-2",
            )}>
            {hasImage && (
              <div className='mx-auto w-64 md:w-80 aspect-3/4 bg-[#101010] border border-white/10 rounded-xl overflow-hidden'>
                <img
                  src={brandStatement.image}
                  alt={brandStatement.title}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
              </div>
            )}
            {items.length > 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                {items.map((item) => (
                  <BenefitItem
                    key={`${item.icon}-${item.title}`}
                    item={item}
                    align='center'
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
