import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 11,
      name: "Oversized Hoodie",
      price: 55,
      dateAdded: new Date(),
      category: "hoodies",
      imageUrl: "/assets/w.hoodie.png",
    },
    {
      id: 12,
      name: "Zip-Up Hoodie",
      price: 50,
      dateAdded: new Date(),
      category: "hoodies",
      imageUrl: "/assets/w.hoodie.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
