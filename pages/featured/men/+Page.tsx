import HeroImg from "#root/assets/Men_s_Page_banner_1.png";
import { Link } from "#root/components/Link.jsx";
import Magnet from "#root/components/Magnet.jsx";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { ErrorSection } from "#root/components/error-section";

const Page: React.FC = () => {
  const fetchData = useData<Data>();

  if (!fetchData.success) {
    return <ErrorSection error={fetchData.error} />;
  }

  const categoryCards = fetchData.subcategories.map((s) => ({
    title: s.name,
    imgUrl: `/uploads/${s.filename}`,
    to: `/featured/men/categories/${s.slug}`,
  }));

  return (
    <section className=" w-full h-full flex flex-col justify-center items-center">
      <section className=" w-full h-full">
        <img src={HeroImg} alt="" className=" w-full h-full " />
      </section>
      <section className=" w-full xl:w-[70%] h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center  pt-6">
        {categoryCards.map((card) => (
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
                  className="max-w-[200px]  xl:max-w-[300px] object-center object-cover"
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
