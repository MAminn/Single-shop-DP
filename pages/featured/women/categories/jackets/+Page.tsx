import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 13,
      name: "Leather Jacket",
      price: 150,
      dateAdded: new Date(),
      category: "jackets",
      imageUrl: "/assets/w.jackets.png",
    },
    {
      id: 14,
      name: "Denim Jacket",
      price: 80,
      dateAdded: new Date(),
      category: "jackets",
      imageUrl: "/assets/w.jackets.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
