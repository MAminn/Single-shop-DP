import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 16,
      name: "Chino Pants",
      price: 60,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
      stock: 25,
    },
    {
      id: 17,
      name: "Slim-fit Jeans",
      price: 75,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
      stock: 20,
    },
    {
      id: 18,
      name: "Cargo Pants",
      price: 65,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
      stock: 15,
    },
    {
      id: 19,
      name: "Track Pants",
      price: 50,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
      stock: 30,
    },
    {
      id: 20,
      name: "Formal Trousers",
      price: 85,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
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
