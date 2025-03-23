import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 21,
      name: "Running Shoes",
      price: 85,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/Men_s shoes.png",
      stock: 14,
    },
    {
      id: 22,
      name: "Casual Sneakers",
      price: 70,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/Men_s shoes.png",
      stock: 18,
    },
    {
      id: 23,
      name: "Dress Shoes",
      price: 95,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/Men_s shoes.png",
      stock: 10,
    },
    {
      id: 24,
      name: "Hiking Boots",
      price: 110,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/Men_s shoes.png",
      stock: 8,
    },
    {
      id: 25,
      name: "Slip-On Loafers",
      price: 65,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/Men_s shoes.png",
      stock: 12,
    },
  ];
  return (
    <CartProvider>
      <div className="flex justify-center items-center h-full w-full pr-6">
        <Sorting Products={mockProducts} />
      </div>
    </CartProvider>
  );
};

export default Page;
