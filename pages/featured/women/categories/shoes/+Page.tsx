import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 19,
      name: "Sneakers",
      price: 90,
      dateAdded: new Date(),
      category: "shoes",
      imageUrl: "/assets/W.shoes.png",
    },
    {
      id: 20,
      name: "Heels",
      price: 110,
      dateAdded: new Date(),
      category: "shoes",
      imageUrl: "/assets/W.shoes.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
