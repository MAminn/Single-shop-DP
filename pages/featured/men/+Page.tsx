import HeroImg from "#root/assets/Men_s_Page_banner_1.webp";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { ErrorSection } from "#root/components/error-section";
import Sorting from "#root/components/sorting";

const Page: React.FC = () => {
  const fetchData = useData<Data>();

  if (!fetchData.success) {
    return <ErrorSection error={fetchData.error} />;
  }

  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <section className="w-full h-full">
        <img src={HeroImg} alt="Men's Collection" className="w-full h-full" />
      </section>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Men's Collection
        </h1>
        <Sorting categoryType="men" categories={fetchData.subcategories} />
      </div>
    </section>
  );
};

export default Page;
