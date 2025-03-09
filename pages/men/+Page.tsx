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
      },
      {
        title: "T-Shirts",
        imgUrl: "/assets/Men_s T-shirt.png",
      },
      {
        title: "Sweaters & Hoodies",
        imgUrl: "/assets/Men_s hoodie.png",
      },
      {
        title: "Pants",
        imgUrl: "/assets/Men_s pants.png",
      },
      {
        title: "Accessories",
        imgUrl: "/assets/Men_s accessories.png",
      },
      {
        title: "Shorts",
        imgUrl: "/assets/Men_s shorts.png",
      },
      {
        title: "Jackets",
        imgUrl: "/assets/Men_s jacket.png",
      },
      {
        title: "Shoes",
        imgUrl: "/assets/Men_s shoes.png",
      },
    ],
    ar: [
      {
        title: "شيرتات",
        imgUrl: "/assets/men_s shirt.png",
      },
      {
        title: "تيشيرتات",
        imgUrl: "/assets/men_s shirt.png",
      },
      {
        title: "سويترات وهوديات",
        imgUrl: "/assets/men_s shirt.png",
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
            href={`/men/${card.title}`}
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
