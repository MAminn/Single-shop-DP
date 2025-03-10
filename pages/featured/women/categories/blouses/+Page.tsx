import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 5,
      name: "Silk Blouse",
      price: 50,
      dateAdded: new Date(),
      category: "blouses",
      imageUrl: "/assets/w.blouses.png",
    },
    {
      id: 6,
      name: "Lace Blouse",
      price: 45,
      dateAdded: new Date(),
      category: "blouses",
      imageUrl: "/assets/w.blouses.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
