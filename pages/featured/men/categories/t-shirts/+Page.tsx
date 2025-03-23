import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 21,
      name: "Basic White Tee",
      price: 25,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/Men_s T-shirt.png",
      stock: 35,
    },
    {
      id: 22,
      name: "Graphic Print Tee",
      price: 30,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/Men_s T-shirt.png",
      stock: 25,
    },
    {
      id: 23,
      name: "V-Neck Tee",
      price: 28,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/Men_s T-shirt.png",
      stock: 30,
    },
    {
      id: 24,
      name: "Long Sleeve Tee",
      price: 35,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/Men_s T-shirt.png",
      stock: 20,
    },
    {
      id: 25,
      name: "Striped Tee",
      price: 32,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/Men_s T-shirt.png",
      stock: 22,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
