import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 23,
      name: "Mini Skirt",
      price: 50,
      dateAdded: new Date(),
      category: "skirts",
      imageUrl: "/assets/w.skirts.png",
    },
    {
      id: 24,
      name: "Midi Skirt",
      price: 55,
      dateAdded: new Date(),
      category: "skirts",
      imageUrl: "/assets/w.skirts.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
