import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 66,
      name: "Denim Shorts",
      price: 45,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/w.shorts.png",
      stock: 22,
    },
    {
      id: 67,
      name: "High-Waisted Shorts",
      price: 48,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/w.shorts.png",
      stock: 18,
    },
    {
      id: 68,
      name: "Linen Shorts",
      price: 42,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/w.shorts.png",
      stock: 24,
    },
    {
      id: 69,
      name: "Bermuda Shorts",
      price: 50,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/w.shorts.png",
      stock: 16,
    },
    {
      id: 70,
      name: "Athletic Shorts",
      price: 35,
      dateAdded: new Date(),
      category: "Shorts",
      imageUrl: "/assets/w.shorts.png",
      stock: 25,
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
