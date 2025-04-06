import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Link } from "./Link";
import AnimatedContent from "./AnimatedContent";
import { usePageContext } from "vike-react/usePageContext";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  lang: "en" | "ar";
  title?: string;
  caption?: string;
  description?: string;
  overlay?: boolean;
  centered?: boolean;
  cta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  imageUrl?: string;
  style?: React.CSSProperties;
  className?: string;
  align?: "left" | "center" | "right";
  textColor?: string;
}

const DEFAULT_IMAGE = "/assets/men-section.webp";

const Hero: React.FC<HeroProps> = ({
  lang = "en",
  title,
  caption,
  description,
  overlay,
  centered,
  cta,
  secondaryCta,
  imageUrl = DEFAULT_IMAGE,
  style,
  className,
  align = "left",
  textColor = "text-white",
}: HeroProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const pageContext = usePageContext();
  const isHomePage = pageContext.urlPathname === "/";

  const cardContent = {
    en: {
      cards: [
        {
          title: "Easy & Accessible",
          description:
            "A seamless shopping experience without the hassle of multiple websites. Customize your wardrobe with a click of a button.",
        },
        {
          title: "Versatile",
          description:
            "A selection of vendors to suit your taste with many more to come!",
        },
        {
          title: "Growing",
          description:
            "Helping brands and small businesses reach more customers.",
        },
      ],
    },
    ar: {
      cards: [
        {
          title: "سهل ويمكن الوصول إليه",
          description:
            "تجربة تسوق سلسة دون عناء التنقل بين مواقع متعددة. قم بتخصيص خزانة ملابسك بنقرة زر واحدة.",
        },
        {
          title: "متعدد الاستخدامات",
          description: "اختيار من البائعين ليناسب ذوقك مع المزيد القادم!",
        },
        {
          title: "في نمو مستمر",
          description:
            "نساعد العلامات التجارية والشركات الصغيرة على الوصول إلى المزيد من العملاء.",
        },
      ],
    },
  };

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      if (window.scrollY < 600) {
        setParallaxOffset(window.scrollY * 0.15);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text alignment classes
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  // Adjust the hero height based on if it's homepage or not
  const heightClass = isHomePage
    ? "min-h-[80vh] md:min-h-[85vh]"
    : "min-h-[40vh] md:min-h-[50vh]";

  return (
    <div
      className={`relative overflow-hidden ${heightClass} w-full ${className}`}
      style={style}
    >
      {/* Parallax Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
        }}
      />

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
          style={{ mixBlendMode: "multiply" }}
        />
      )}

      {/* Content */}
      <div
        className={`relative z-[9] container mx-auto px-6 flex flex-col justify-center ${
          centered ? "h-full items-center text-center" : "h-full"
        } ${alignClasses[align]}`}
      >
        <AnimatedContent
          distance={50}
          direction="vertical"
          reverse={false}
          config={{ tension: 100, friction: 20 }}
          initialOpacity={0}
          threshold={0.1}
          animateOpacity
          scale={1}
        >
          <div
            className={`max-w-lg ${
              align === "center" ? "mx-auto" : ""
            } space-y-5`}
          >
            {caption && (
              <div
                className="transform transition-all duration-700 delay-100"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${textColor === "text-white" ? "bg-white/20 backdrop-blur-sm" : "bg-black/20"} ${textColor}`}
                >
                  {caption}
                </span>
              </div>
            )}

            {title && (
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${textColor} transform transition-all duration-700 delay-200`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {title}
              </h1>
            )}

            {description && (
              <p
                className={`text-base md:text-lg ${textColor === "text-white" ? "text-gray-200" : "text-gray-700"} max-w-md transform transition-all duration-700 delay-300`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {description}
              </p>
            )}

            <div
              className="flex flex-wrap gap-4 pt-2 transform transition-all duration-700 delay-400"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {cta && (
                <Button
                  asChild
                  size="lg"
                  className="relative overflow-hidden group bg-accent-lb hover:bg-accent-db text-white transition-all duration-300"
                >
                  <Link href={cta.href}>
                    <span className="relative z-[9]">{cta.text}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 w-0 bg-accent-db group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </Button>
              )}

              {secondaryCta && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={`border-2 ${
                    textColor === "text-white"
                      ? "border-white text-white hover:bg-white hover:text-accent-lb"
                      : "border-accent-lb text-accent-lb hover:bg-accent-lb hover:text-white"
                  } transition-colors duration-300`}
                >
                  <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
                </Button>
              )}
            </div>
          </div>
        </AnimatedContent>
      </div>

      {/* Hero bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 70"
          className="w-full h-auto fill-white"
          preserveAspectRatio="none"
          aria-label="Decorative wave pattern at bottom of hero section"
          role="img"
        >
          <path d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,70L1380,70C1320,70,1200,70,1080,70C960,70,840,70,720,70C600,70,480,70,360,70C240,70,120,70,60,70L0,70Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
