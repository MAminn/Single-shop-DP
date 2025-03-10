import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 9,
      name: "Summer Dress",
      price: 60,
      dateAdded: new Date(),
      category: "dresses",
      imageUrl: "/assets/w.dress.png",
    },
    {
      id: 10,
      name: "Evening Gown",
      price: 120,
      dateAdded: new Date(),
      category: "dresses",
      imageUrl: "/assets/w.dress.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
