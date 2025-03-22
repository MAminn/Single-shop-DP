import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 51,
      name: "Pencil Skirt",
      price: 45,
      dateAdded: new Date(),
      category: "Skirts",
      imageUrl: "/assets/w.skirts.png",
      stock: 16,
    },
    {
      id: 52,
      name: "A-Line Skirt",
      price: 50,
      dateAdded: new Date(),
      category: "Skirts",
      imageUrl: "/assets/w.skirts.png",
      stock: 14,
    },
    {
      id: 53,
      name: "Pleated Skirt",
      price: 55,
      dateAdded: new Date(),
      category: "Skirts",
      imageUrl: "/assets/w.skirts.png",
      stock: 12,
    },
    {
      id: 54,
      name: "Midi Skirt",
      price: 48,
      dateAdded: new Date(),
      category: "Skirts",
      imageUrl: "/assets/w.skirts.png",
      stock: 18,
    },
    {
      id: 55,
      name: "Denim Skirt",
      price: 40,
      dateAdded: new Date(),
      category: "Skirts",
      imageUrl: "/assets/w.skirts.png",
      stock: 20,
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
