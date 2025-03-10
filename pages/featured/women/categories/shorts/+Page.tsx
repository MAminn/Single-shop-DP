import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 21,
      name: "Denim Shorts",
      price: 45,
      dateAdded: new Date(),
      category: "shorts",
      imageUrl: "/assets/W.SHORTS.png",
    },
    {
      id: 22,
      name: "Linen Shorts",
      price: 40,
      dateAdded: new Date(),
      category: "shorts",
      imageUrl: "/assets/W.SHORTS.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
