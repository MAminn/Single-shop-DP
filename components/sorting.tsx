import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  dateAdded: Date;
};

interface SortingProps {
  Products: Product[];
}

type SortCriteria =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";

const Sorting: React.FC<SortingProps> = ({ Products }: SortingProps) => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("featured");
  const toBeSorted = [...Products];
  const [products, setProducts] = useState(toBeSorted);

  const handleSort = (criteria: SortCriteria) => {
    const sortedProducts = [...toBeSorted];

    switch (criteria) {
      case "featured":
        break;
      case "name-asc":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        sortedProducts.sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );
        break;
      case "date-desc":
        sortedProducts.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
      default:
        break;
    }

    setProducts(sortedProducts);
    setSortCriteria(criteria);
  };

  return (
    <div className="space-y-4 w-full h-full">
      {/* Sorting Dropdown */}
      <div className="flex-wrap flex flex-col md:flex-row justify-end mt-6 items-center w-full gap-2">
        <span className="text-sm font-medium ">Sort by:</span>
        <Select
          value={sortCriteria}
          onValueChange={(value) => handleSort(value as SortCriteria)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select sort criteria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="name-asc">Alphabetical: A-Z</SelectItem>
            <SelectItem value="name-desc">Alphabetical: Z-A</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="date-asc">Date: Old to New</SelectItem>
            <SelectItem value="date-desc">Date: New to Old</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center items-center w-full h-full gap-4 ">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 justify-center items-center object-cover w-[80%] h-full"
          >
            <img src={product.imageUrl} alt="" />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500">
              Added: {new Date(product.dateAdded).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sorting;
