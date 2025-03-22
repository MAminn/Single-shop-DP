import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 16,
      name: "Chino Shorts",
      price: 35,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/Men_s shorts.png",
      stock: 24,
    },
    {
      id: 17,
      name: "Athletic Shorts",
      price: 30,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/Men_s shorts.png",
      stock: 30,
    },
    {
      id: 18,
      name: "Cargo Shorts",
      price: 38,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/Men_s shorts.png",
      stock: 16,
    },
    {
      id: 19,
      name: "Swim Shorts",
      price: 32,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/Men_s shorts.png",
      stock: 22,
    },
    {
      id: 20,
      name: "Denim Shorts",
      price: 40,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/Men_s shorts.png",
      stock: 18,
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
