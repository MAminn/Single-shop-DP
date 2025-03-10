import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 17,
      name: "Button-Up Shirt",
      price: 40,
      dateAdded: new Date(),
      category: "shirts",
      imageUrl: "/assets/W.shirts.png",
    },
    {
      id: 18,
      name: "Casual Shirt",
      price: 35,
      dateAdded: new Date(),
      category: "shirts",
      imageUrl: "/assets/W.shirts.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
