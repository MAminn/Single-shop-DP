import Sorting from "#root/components/sorting";
import type { Product } from "#root/lib/mock-data/products";

const Page = () => {
  const mockProducts: Product[] = [
    {
      id: 86,
      name: "V-Neck T-Shirt",
      price: 25,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/W.TSHIRT.png",
      stock: 30,
    },
    {
      id: 87,
      name: "Crop Top T-Shirt",
      price: 28,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/W.TSHIRT.png",
      stock: 22,
    },
    {
      id: 88,
      name: "Graphic Print T-Shirt",
      price: 32,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/W.TSHIRT.png",
      stock: 18,
    },
    {
      id: 89,
      name: "Fitted Basic T-Shirt",
      price: 22,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/W.TSHIRT.png",
      stock: 35,
    },
    {
      id: 90,
      name: "Oversized T-Shirt",
      price: 30,
      dateAdded: new Date(),
      category: "T-Shirts",
      imageUrl: "/assets/W.TSHIRT.png",
      stock: 25,
    },
  ];
  return (
    <div className="flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
