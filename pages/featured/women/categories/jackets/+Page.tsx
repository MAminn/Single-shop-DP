import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 91,
      name: "Leather Jacket",
      price: 150,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/w.jackets.png",
      stock: 8,
    },
    {
      id: 92,
      name: "Denim Jacket",
      price: 85,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/w.jackets.png",
      stock: 15,
    },
    {
      id: 93,
      name: "Blazer",
      price: 95,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/w.jackets.png",
      stock: 12,
    },
    {
      id: 94,
      name: "Trench Coat",
      price: 120,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/w.jackets.png",
      stock: 10,
    },
    {
      id: 95,
      name: "Puffer Jacket",
      price: 110,
      dateAdded: new Date(),
      category: "Jackets",
      imageUrl: "/assets/w.jackets.png",
      stock: 14,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
