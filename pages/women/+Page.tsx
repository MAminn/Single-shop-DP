import HeroImg from "#root/assets/Women_s_banner.png";
import { Link } from "#root/components/Link.jsx";
import Magnet from "#root/components/Magnet.jsx";

interface Props {
  lang: "en" | "ar";
}
const Page: React.FC<Props> = ({ lang = "en" }: Props) => {
  const categoryCards = {
    en: [
      {
        title: "Accessories",
        imgUrl: "/assets/w.accessories.png",
      },
      {
        title: "Blouses",
        imgUrl: "/assets/w.blouses.png",
      },
      {
        title: "Body Suits",
        imgUrl: "/assets/w.body suit.png",
      },
      {
        title: "Dresses",
        imgUrl: "/assets/w.dress.png",
      },
      {
        title: "Hoodies",
        imgUrl: "/assets/w.hoodie.png",
      },
      {
        title: "Jackets",
        imgUrl: "/assets/w.jackets.png",
      },
      {
        title: "Pants",
        imgUrl: "/assets/w.pants.png",
      },
      {
        title: "Shirts",
        imgUrl: "/assets/W.shirts.png",
      },
      {
        title: "Shoes",
        imgUrl: "/assets/W.shoes.png",
      },
      {
        title: "Shorts",
        imgUrl: "/assets/W.SHORTS.png",
      },
      {
        title: "Skirts",
        imgUrl: "/assets/w.skirts.png",
      },
      {
        title: "T-Shirts",
        imgUrl: "/assets/W.TSHIRT.png",
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
            href={`/women/${card.title}`}
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
