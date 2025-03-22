import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Casual Shirt",
      price: 35,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/men_s shirt.png",
      stock: 25,
    },
    {
      id: 2,
      name: "Formal Shirt",
      price: 45,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/men_s shirt.png",
      stock: 15,
    },
    {
      id: 3,
      name: "Denim Shirt",
      price: 40,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/men_s shirt.png",
      stock: 20,
    },
    {
      id: 4,
      name: "Flannel Shirt",
      price: 38,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/men_s shirt.png",
      stock: 30,
    },
    {
      id: 5,
      name: "Oxford Shirt",
      price: 50,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/men_s shirt.png",
      stock: 10,
    },
  ];

  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
