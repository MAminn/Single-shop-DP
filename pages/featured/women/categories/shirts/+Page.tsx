import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 101,
      name: "Silk Blouse",
      price: 45,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/W.shirts.png",
      stock: 18,
    },
    {
      id: 102,
      name: "Button-Up Shirt",
      price: 35,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/W.shirts.png",
      stock: 12,
    },
    {
      id: 103,
      name: "Elegant Top",
      price: 50,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/W.shirts.png",
      stock: 7,
    },
    {
      id: 104,
      name: "Casual Blouse",
      price: 30,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/W.shirts.png",
      stock: 25,
    },
    {
      id: 105,
      name: "Summer Shirt",
      price: 28,
      dateAdded: new Date(),
      category: "Shirts",
      imageUrl: "/assets/W.shirts.png",
      stock: 15,
    },
  ];

  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
