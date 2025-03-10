import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 25,
      name: "Graphic T-Shirt",
      price: 25,
      dateAdded: new Date(),
      category: "t-shirts",
      imageUrl: "/assets/W.TSHIRT.png",
    },
    {
      id: 26,
      name: "Basic T-Shirt",
      price: 20,
      dateAdded: new Date(),
      category: "t-shirts",
      imageUrl: "/assets/W.TSHIRT.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
