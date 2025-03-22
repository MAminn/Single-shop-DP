import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 76,
      name: "Bracelet Set",
      price: 30,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/w.accessories.png",
      stock: 25,
    },
    {
      id: 77,
      name: "Statement Necklace",
      price: 45,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/w.accessories.png",
      stock: 15,
    },
    {
      id: 78,
      name: "Earring Set",
      price: 35,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/w.accessories.png",
      stock: 20,
    },
    {
      id: 79,
      name: "Anklet",
      price: 25,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/w.accessories.png",
      stock: 30,
    },
    {
      id: 80,
      name: "Hair Accessories",
      price: 20,
      dateAdded: new Date(),
      category: "Accessories",
      imageUrl: "/assets/w.accessories.png",
      stock: 35,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
