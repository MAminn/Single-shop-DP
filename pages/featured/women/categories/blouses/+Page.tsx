import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 61,
      name: "Silk Blouse",
      price: 60,
      dateAdded: new Date(),
      category: "Blouses",
      imageUrl: "/assets/w.blouses.png",
      stock: 14,
    },
    {
      id: 62,
      name: "Chiffon Blouse",
      price: 55,
      dateAdded: new Date(),
      category: "Blouses",
      imageUrl: "/assets/w.blouses.png",
      stock: 18,
    },
    {
      id: 63,
      name: "Button-Up Blouse",
      price: 48,
      dateAdded: new Date(),
      category: "Blouses",
      imageUrl: "/assets/w.blouses.png",
      stock: 20,
    },
    {
      id: 64,
      name: "Lace Blouse",
      price: 65,
      dateAdded: new Date(),
      category: "Blouses",
      imageUrl: "/assets/w.blouses.png",
      stock: 12,
    },
    {
      id: 65,
      name: "Peasant Blouse",
      price: 50,
      dateAdded: new Date(),
      category: "Blouses",
      imageUrl: "/assets/w.blouses.png",
      stock: 16,
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
