import HeroImg from "#root/assets/landing-hero.png";
import { Link } from "./Link";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#root/components/ui/accordion";
interface HeroProps {
  lang: "en" | "ar";
}

const Hero: React.FC<HeroProps> = ({ lang = "en" }: HeroProps) => {
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

  return (
    <section className=" w-full h-full">
      <section className=" w-full h-[200px] md:h-full">
        <img src={HeroImg} alt="" className=" w-full h-full " />
      </section>
      <section className=" w-full h-[300px] md:h-[400px] men-section-image bg-center bg-cover bg-fixed flex justify-center items-center flex-col ">
        <h1 className=" text-3xl md:text-6xl font-bold text-white uppercase">
          Men
        </h1>
        <Link href="/featured/men">
          <Button className=" w-full h-full md:py-4 md:px-6 py-2 px-4 mt-4 text-sm md:text-xl bg-accent-lb transition-all duration-300">
            Shop
          </Button>
        </Link>
      </section>
      <section className=" w-full h-[300px] md:h-[400px] women-section-image bg-center bg-cover bg-fixed flex justify-center items-center flex-col ">
        <h1 className=" text-3xl md:text-6xl font-bold text-white uppercase">
          Women
        </h1>
        <Link href="/featured/women">
          <Button className=" w-full h-full md:py-4 md:px-6 py-2 px-4 mt-4 text-sm md:text-xl bg-accent-lb transition-all duration-300">
            Shop
          </Button>
        </Link>
      </section>
      <section className=" w-full h-[300px] md:h-[400px] men-section-image bg-center bg-cover bg-fixed flex justify-center items-center flex-col ">
        <h1 className=" text-3xl md:text-6xl font-bold text-white uppercase">
          Brands
        </h1>
        <Link href="/featured/brands">
          <Button className=" w-full h-full md:py-4 md:px-6 py-2 px-4 mt-4 text-sm md:text-xl bg-accent-lb transition-all duration-300">
            Shop
          </Button>
        </Link>
      </section>
      <section className=" w-full h-[400px] md:h-[500px] flex justify-center items-center flex-col md:flex-row relative ">
        <div className=" bg-white p-4 w-full h-[300px] rounded-2xl max-2xl:bottom-[-40%] 2xl:left-[20%] absolute max-w-[200px] md:max-w-[400px] flex flex-col justify-center items-center">
          <h1 className="text-2xl md:text-4xl font-semibold mb-6">Our Story</h1>
          <p className=" text-xs md:text-sm text-center">
            We started Lebsy because shopping for clothes online was
            frustrating, too many websites, too much hassle. So, we built one
            place where all clothing sellers come together, making fashion
            shopping easier for everyone.
          </p>
        </div>
        <div className="img1 md:w-[85%] 2xl:w-[35%] w-[90%] h-full bg-center bg-cover"></div>
      </section>
      <section className=" w-full h-full max-2xl:mt-[200px] max-md:mt-[230px] max-xl:px-10">
        <div className=" w-full h-full flex justify-center items-center gap-6 flex-col md:flex-row ">
          {cardContent[lang].cards.map((card) => (
            <div
              key={card.title}
              className=" bg-gray-100 p-4 w-full h-[240px] md:h-[300px] rounded-2xl max-w-[250px] md:max-w-[400px] flex flex-col justify-center items-center"
            >
              <h1 className="text-2xl md:text-4xl text-center font-semibold mb-6">
                {card.title}
              </h1>
              <p className=" text-xs md:text-sm text-center">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className=" w-full h-full flex justify-center items-center flex-col ">
        <div className=" w-full h-full flex flex-col justify-center items-center max-w-[700px] px-8">
          <h1 className="text-2xl md:text-4xl text-center font-semibold mb-6 mt-10">
            FAQ
          </h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="header">
                Shipping and Delivery
              </AccordionTrigger>
              <AccordionContent>
                We ship across Egypt, delivering orders within a week (Not
                including holidays). Shipping costs vary based on order details
                and location, with support available at cs@Lebsey.com for any
                issues.{" "}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="header">Need Help?</AccordionTrigger>
              <AccordionContent>
                Feel free to reach out via WhatsApp at 01507135600 or email us
                at cs@lebsey.com—we’re always happy to help!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="header">
                Join Our network of vendors
              </AccordionTrigger>
              <AccordionContent>Become a vendor Now!</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </section>
  );
};

export default Hero;
