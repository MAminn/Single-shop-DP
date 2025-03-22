import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 41,
      name: "Heeled Sandals",
      price: 75,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/w.shoes.png",
      stock: 14,
    },
    {
      id: 42,
      name: "Flats",
      price: 55,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/w.shoes.png",
      stock: 20,
    },
    {
      id: 43,
      name: "Ankle Boots",
      price: 95,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/w.shoes.png",
      stock: 10,
    },
    {
      id: 44,
      name: "Sneakers",
      price: 70,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/w.shoes.png",
      stock: 16,
    },
    {
      id: 45,
      name: "Pumps",
      price: 85,
      dateAdded: new Date(),
      category: "Shoes",
      imageUrl: "/assets/w.shoes.png",
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
