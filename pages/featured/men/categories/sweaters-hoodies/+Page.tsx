import Sorting from "#root/components/sorting";
import { CartProvider } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 31,
      name: "Pullover Hoodie",
      price: 55,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/Men_s hoodie.png",
      stock: 20,
    },
    {
      id: 32,
      name: "Zip-Up Hoodie",
      price: 60,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/Men_s hoodie.png",
      stock: 15,
    },
    {
      id: 33,
      name: "Crewneck Sweater",
      price: 50,
      dateAdded: new Date(),
      category: "Sweaters",
      imageUrl: "/assets/Men_s hoodie.png",
      stock: 18,
    },
    {
      id: 34,
      name: "Cardigan",
      price: 65,
      dateAdded: new Date(),
      category: "Sweaters",
      imageUrl: "/assets/Men_s hoodie.png",
      stock: 10,
    },
    {
      id: 35,
      name: "Fleece Jacket",
      price: 45,
      dateAdded: new Date(),
      category: "Hoodies",
      imageUrl: "/assets/Men_s hoodie.png",
      stock: 22,
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
