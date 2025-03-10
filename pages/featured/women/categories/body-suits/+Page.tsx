import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 7,
      name: "Bodysuit with Lace",
      price: 35,
      dateAdded: new Date(),
      category: "body suits",
      imageUrl: "/assets/w.body suit.png",
    },
    {
      id: 8,
      name: "Basic Bodysuit",
      price: 30,
      dateAdded: new Date(),
      category: "body suits",
      imageUrl: "/assets/w.body suit.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
