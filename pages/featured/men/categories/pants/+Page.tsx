import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 1,
      name: "Basic Tee",
      price: 20,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
    },
    {
      id: 2,
      name: "Premium Shirt",
      price: 40,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
    },
    {
      id: 3,
      name: "Casual Shirt",
      price: 30,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
    },
    {
      id: 4,
      name: "Sport Shirt",
      price: 25,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
    },
    {
      id: 5,
      name: "Linen Shirt",
      price: 35,
      dateAdded: new Date(),
      category: "Pants",
      imageUrl: "/assets/Men_s pants.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
