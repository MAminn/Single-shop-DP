import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 56,
      name: "Skinny Jeans",
      price: 55,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/w.pants.png",
      stock: 24,
    },
    {
      id: 57,
      name: "Wide Leg Pants",
      price: 60,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/w.pants.png",
      stock: 18,
    },
    {
      id: 58,
      name: "Leggings",
      price: 40,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/w.pants.png",
      stock: 30,
    },
    {
      id: 59,
      name: "Palazzo Pants",
      price: 65,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/w.pants.png",
      stock: 12,
    },
    {
      id: 60,
      name: "High-Waisted Pants",
      price: 58,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/w.pants.png",
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
