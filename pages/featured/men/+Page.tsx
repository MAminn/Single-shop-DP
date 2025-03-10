import HeroImg from "#root/assets/Men_s_Page_banner_1.png";
import { Link } from "#root/components/Link.jsx";
import Magnet from "#root/components/Magnet.jsx";

interface Props {
  lang: "en" | "ar";
}
const Page: React.FC<Props> = ({ lang = "en" }: Props) => {
  const categoryCards = {
    en: [
      {
        title: "Shirts",
        imgUrl: "/assets/men_s shirt.png",
        to: "/featured/men/categories/shirts",
      },
      {
        title: "T-Shirts",
        imgUrl: "/assets/Men_s T-shirt.png",
        to: "/featured/men/categories/t-shirts",
      },
      {
        title: "Sweaters & Hoodies",
        imgUrl: "/assets/Men_s hoodie.png",
        to: "/featured/men/categories/hoodies",
      },
      {
        title: "Pants",
        imgUrl: "/assets/Men_s pants.png",
        to: "/featured/men/categories/pants",
      },
      {
        title: "Accessories",
        imgUrl: "/assets/Men_s accessories.png",
        to: "/featured/men/categories/accessories",
      },
      {
        title: "Shorts",
        imgUrl: "/assets/Men_s shorts.png",
        to: "/featured/men/categories/shorts",
      },
      {
        title: "Jackets",
        imgUrl: "/assets/Men_s jacket.png",
        to: "/featured/men/categories/jackets",
      },
      {
        title: "Shoes",
        imgUrl: "/assets/Men_s shoes.png",
        to: "/featured/men/categories/shoes",
      },
    ],
    ar: [
      {
        title: "شيرتات",
        imgUrl: "/assets/men_s shirt.png",
        to: "/featured/men/categories/shirts",
      },
      {
        title: "تيشيرتات",
        imgUrl: "/assets/men_s shirt.png",
        to: "/featured/men/categories/t-shirts",
      },
      {
        title: "سويترات وهوديات",
        imgUrl: "/assets/men_s shirt.png",
        to: "/featured/men/categories/hoodies",
      },
    ],
  };

  return (
    <section className=" w-full h-full flex flex-col justify-center items-center">
      <section className=" w-full h-full">
        <img src={HeroImg} alt="" className=" w-full h-full " />
      </section>
      <section className=" w-full xl:w-[70%] h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center  pt-6">
        {categoryCards[lang].map((card) => (
          <Link
            href={`${card.to}`}
            key={card.title}
            className="w-full h-full  justify-self-center "
          >
            <Magnet padding={50} disabled={false} magnetStrength={4}>
              <div className=" w-full h-full flex flex-col justify-center items-center">
                <img
                  src={card.imgUrl}
                  alt="img"
                  className="max-w-[200px] xl:max-w-[300px] object-center object-cover"
                />
                <h1 className="text-xl md:text-2xl text-center font-semibold mb-6 mt-10">
                  {card.title}
                </h1>
              </div>
            </Magnet>
          </Link>
        ))}
      </section>
    </section>
  );
};

export default Page;
