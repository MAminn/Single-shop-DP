import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 71,
      name: "Oversized Hoodie",
      price: 55,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/w.hoodie.png",
      stock: 20,
    },
    {
      id: 72,
      name: "Crop Hoodie",
      price: 50,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/w.hoodie.png",
      stock: 18,
    },
    {
      id: 73,
      name: "Zip-Up Hoodie",
      price: 60,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/w.hoodie.png",
      stock: 15,
    },
    {
      id: 74,
      name: "Pullover Hoodie",
      price: 52,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/w.hoodie.png",
      stock: 22,
    },
    {
      id: 75,
      name: "Graphic Hoodie",
      price: 58,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/w.hoodie.png",
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
