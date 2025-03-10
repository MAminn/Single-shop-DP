import Sorting from "#root/components/sorting.jsx";

const Page = () => {
  const mockProducts = [
    {
      id: 1,
      name: "Bracelets",
      price: 20,
      dateAdded: new Date(),
      category: "accessories",
      imageUrl: "/assets/w.accessories.png",
    },
    {
      id: 2,
      name: "Rings",
      price: 40,
      dateAdded: new Date(),
      category: "accessories",
      imageUrl: "/assets/w.accessories.png",
    },
    {
      id: 3,
      name: "Necklaces",
      price: 30,
      dateAdded: new Date(),
      category: "accessories",
      imageUrl: "/assets/w.accessories.png",
    },
    {
      id: 4,
      name: "Watch",
      price: 25,
      dateAdded: new Date(),
      category: "accessories",
      imageUrl: "/assets/w.accessories.png",
    },
  ];
  return (
    <div className=" flex justify-center items-center h-full w-full pr-6">
      <Sorting Products={mockProducts} />
    </div>
  );
};

export default Page;
