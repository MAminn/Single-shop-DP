import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 15,
      name: "High-Waisted Pants",
      price: 70,
      dateAdded: new Date(),
      category: "pants",
      imageUrl: "/assets/w.pants.png",
    },
    {
      id: 16,
      name: "Wide-Leg Pants",
      price: 65,
      dateAdded: new Date(),
      category: "pants",
      imageUrl: "/assets/w.pants.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
