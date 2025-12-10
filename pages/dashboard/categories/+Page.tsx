import { useState, useEffect } from "react";
import { Link } from "#root/components/utils/Link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { ErrorSection } from "#root/components/dashboard/ErrorSection";

export default function Categories() {
  const categories = ["men", "women"] as const;
  const fetchData = useData<Data>();

  if (!fetchData.success) {
    return <ErrorSection error={fetchData.error} />;
  }

  const subCategories = fetchData.subcategories;

  const getSubcategories = (category: (typeof categories)[number]) => {
    return subCategories.filter((s) => s.type === category);
  };

  return (
    <div className='p-6 w-full h-full mx-auto'>
      <div className='flex flex-col lg:flex-row gap-4 justify-between items-center mb-6'>
        <div className='flex flex-col gap-2 items-center lg:items-start'>
          <h1 className='text-2xl font-bold'>Categories</h1>
          <p className='text-slate-500'>Manage your product categories</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categories.map((category) => {
          const subcategories = getSubcategories(category);

          return (
            <Card key={category} className='relative group p-4'>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <CardTitle className='capitalize'>{category}</CardTitle>
                </div>
                <CardDescription>
                  {subcategories.length} subcategories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-1'>
                  {subcategories.slice(0, 3).map((subcategory) => (
                    <li key={subcategory.id} className='text-sm'>
                      {subcategory.name} ({subcategory.productCount} products)
                    </li>
                  ))}
                  {subcategories.length > 3 && (
                    <li className='text-sm text-slate-500'>
                      +{subcategories.length - 3} more...
                    </li>
                  )}
                  {subcategories.length === 0 && (
                    <li className='text-sm text-slate-500 italic'>
                      No subcategories yet
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant='outline' className='w-full' asChild>
                  <Link href={`/dashboard/categories/${category}`}>
                    Manage Subcategories
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
