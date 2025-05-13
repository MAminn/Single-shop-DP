import Sorting from "./sorting";

const menProducts = [
  {
    id: 1,
    name: "Men's Shirt",
    price: 30,
    discountPrice: null,
    category: "shirts",
    imageUrl: "/assets/men_s shirt.webp",
    dateAdded: new Date(),
  },
  {
    id: 2,
    name: "Men's Jacket",
    price: 100,
    discountPrice: 80,
    category: "jackets",
    imageUrl: "/assets/Men_s jacket.webp",
    dateAdded: new Date(),
  },
  {
    id: 3,
    name: "Men's Shoes",
    price: 80,
    discountPrice: null,
    category: "shoes",
    imageUrl: "/assets/Men_s shoes.webp",
    dateAdded: new Date(),
  },
];

const womenProducts = [
  {
    id: 5,
    name: "Women's Dress",
    price: 60,
    discountPrice: 45,
    category: "dresses",
    imageUrl: "/assets/w.dress.webp",
    dateAdded: new Date(),
  },
  {
    id: 6,
    name: "Women's Hoodie",
    price: 55,
    discountPrice: null,
    category: "hoodies",
    imageUrl: "/assets/w.hoodie.webp",
    dateAdded: new Date(),
  },
  {
    id: 7,
    name: "Women's Shoes",
    price: 110,
    discountPrice: 90,
    category: "shoes",
    imageUrl: "/assets/W.shoes.webp",
    dateAdded: new Date(),
  },
  {
    id: 8,
    name: "Women's Skirt",
    price: 50,
    discountPrice: null,
    category: "skirts",
    imageUrl: "/assets/w.skirts.webp",
    dateAdded: new Date(),
  },
];

const allProducts = [...menProducts, ...womenProducts];

const featuredProducts = allProducts.slice(0, 8);

export default function Featured() {
  return (
    <div className=" h-full w-full p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover mb-2"
            />
            <h3 className="font-medium">{product.name}</h3>
            {product.discountPrice ? (
              <div className="flex flex-col">
                <p className="text-gray-400 line-through">
                  {product.price} EGP
                </p>
                <p className="text-red-600">{product.discountPrice} EGP</p>
              </div>
            ) : (
              <p className="text-gray-600">{product.price} EGP</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
