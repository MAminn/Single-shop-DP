import Sorting from "./sorting";

const menProducts = [
  {
    id: 1,
    name: "Men's Shirt",
    price: 30,
    category: "shirts",
    imageUrl: "/assets/men_s shirt.png",
    dateAdded: new Date(),
  },
  {
    id: 2,
    name: "Men's Jacket",
    price: 100,
    category: "jackets",
    imageUrl: "/assets/Men_s jacket.png",
    dateAdded: new Date(),
  },
  {
    id: 3,
    name: "Men's Shoes",
    price: 80,
    category: "shoes",
    imageUrl: "/assets/Men_s shoes.png",
    dateAdded: new Date(),
  },
];

const womenProducts = [
  {
    id: 5,
    name: "Women's Dress",
    price: 60,
    category: "dresses",
    imageUrl: "/assets/w.dress.png",
    dateAdded: new Date(),
  },
  {
    id: 6,
    name: "Women's Hoodie",
    price: 55,
    category: "hoodies",
    imageUrl: "/assets/w.hoodie.png",
    dateAdded: new Date(),
  },
  {
    id: 7,
    name: "Women's Shoes",
    price: 110,
    category: "shoes",
    imageUrl: "/assets/W.shoes.png",
    dateAdded: new Date(),
  },
  {
    id: 8,
    name: "Women's Skirt",
    price: 50,
    category: "skirts",
    imageUrl: "/assets/w.skirts.png",
    dateAdded: new Date(),
  },
];

const allProducts = [...menProducts, ...womenProducts];

const featuredProducts = allProducts.slice(0, 8);

export default function Featured() {
  return (
    <div className=" h-full w-full p-6">
      <Sorting Products={featuredProducts} />
    </div>
  );
}
