import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 46,
      name: "Maxi Dress",
      price: 65,
      dateAdded: new Date(),
      category: "Dresses",
      imageUrl: "/assets/w.dress.png",
      stock: 18,
    },
    {
      id: 47,
      name: "Cocktail Dress",
      price: 85,
      dateAdded: new Date(),
      category: "Dresses",
      imageUrl: "/assets/w.dress.png",
      stock: 12,
    },
    {
      id: 48,
      name: "Casual Sundress",
      price: 55,
      dateAdded: new Date(),
      category: "Dresses",
      imageUrl: "/assets/w.dress.png",
      stock: 20,
    },
    {
      id: 49,
      name: "Wrap Dress",
      price: 60,
      dateAdded: new Date(),
      category: "Dresses",
      imageUrl: "/assets/w.dress.png",
      stock: 15,
    },
    {
      id: 50,
      name: "Bodycon Dress",
      price: 70,
      dateAdded: new Date(),
      category: "Dresses",
      imageUrl: "/assets/w.dress.png",
      stock: 10,
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
