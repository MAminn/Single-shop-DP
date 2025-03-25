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
        to: "/featured/women/categories/accessories",
      },
      {
        title: "Blouses",
        imgUrl: "/assets/w.blouses.png",
        to: "/featured/women/categories/blouses",
      },
      {
        title: "Body Suits",
        imgUrl: "/assets/w.body suit.png",
        to: "/featured/women/categories/body-suits",
      },
      {
        title: "Dresses",
        imgUrl: "/assets/w.dress.png",
        to: "/featured/women/categories/dresses",
      },
      {
        title: "Hoodies",
        imgUrl: "/assets/w.hoodie.png",
        to: "/featured/women/categories/hoodies",
      },
      {
        title: "Jackets",
        imgUrl: "/assets/w.jackets.png",
        to: "/featured/women/categories/jackets",
      },
      {
        title: "Pants",
        imgUrl: "/assets/w.pants.png",
        to: "/featured/women/categories/pants",
      },
      {
        title: "Shirts",
        imgUrl: "/assets/W.shirts.png",
        to: "/featured/women/categories/shirts",
      },
      {
        title: "Shoes",
        imgUrl: "/assets/W.shoes.png",
        to: "/featured/women/categories/shoes",
      },
      {
        title: "Shorts",
        imgUrl: "/assets/W.SHORTS.png",
        to: "/featured/women/categories/shorts",
      },
      {
        title: "Skirts",
        imgUrl: "/assets/w.skirts.png",
        to: "/featured/women/categories/skirts",
      },
      {
        title: "T-Shirts",
        imgUrl: "/assets/W.TSHIRT.png",
        to: "/featured/women/categories/t-shirts",
      },
    ],
    ar: [],
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
            className="w-full h-full flex flex-col justify-center items-center justify-self-center "
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
