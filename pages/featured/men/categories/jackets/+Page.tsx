import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 11,
      name: "Leather Jacket",
      price: 180,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/Men_s jacket.png",
      stock: 10,
    },
    {
      id: 12,
      name: "Bomber Jacket",
      price: 120,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/Men_s jacket.png",
      stock: 15,
    },
    {
      id: 13,
      name: "Denim Jacket",
      price: 95,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/Men_s jacket.png",
      stock: 20,
    },
    {
      id: 14,
      name: "Windbreaker",
      price: 85,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/Men_s jacket.png",
      stock: 18,
    },
    {
      id: 15,
      name: "Puffer Jacket",
      price: 150,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/Men_s jacket.png",
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
