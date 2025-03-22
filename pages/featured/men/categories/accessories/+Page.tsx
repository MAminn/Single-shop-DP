import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 6,
      name: "Watch",
      price: 120,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/Men_s accessories.png",
      stock: 8,
    },
    {
      id: 7,
      name: "Wallet",
      price: 45,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/Men_s accessories.png",
      stock: 15,
    },
    {
      id: 8,
      name: "Belt",
      price: 35,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/Men_s accessories.png",
      stock: 20,
    },
    {
      id: 9,
      name: "Sunglasses",
      price: 60,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/Men_s accessories.png",
      stock: 12,
    },
    {
      id: 10,
      name: "Hat",
      price: 25,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/Men_s accessories.png",
      stock: 18,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
