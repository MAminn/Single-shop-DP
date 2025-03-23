import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 81,
      name: "Lace Trim Bodysuit",
      price: 45,
      dateAdded: new Date(),
      category: "Bodysuits",
      imageUrl: "/assets/w.body suit.png",
      stock: 18,
    },
    {
      id: 82,
      name: "Basic Bodysuit",
      price: 35,
      dateAdded: new Date(),
      category: "Bodysuits",
      imageUrl: "/assets/w.body suit.png",
      stock: 25,
    },
    {
      id: 83,
      name: "Long Sleeve Bodysuit",
      price: 48,
      dateAdded: new Date(),
      category: "Bodysuits",
      imageUrl: "/assets/w.body suit.png",
      stock: 15,
    },
    {
      id: 84,
      name: "V-neck Bodysuit",
      price: 42,
      dateAdded: new Date(),
      category: "Bodysuits",
      imageUrl: "/assets/w.body suit.png",
      stock: 20,
    },
    {
      id: 85,
      name: "Mesh Panel Bodysuit",
      price: 50,
      dateAdded: new Date(),
      category: "Bodysuits",
      imageUrl: "/assets/w.body suit.png",
      stock: 12,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
