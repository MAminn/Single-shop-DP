import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import type { SortingPageProduct } from "#root/components/template-system/sorting/SortingMinimalTemplate";
import { useSearchParams } from "#root/hooks/useSearchParams";

/**
 * /shop – Canonical all-products collection page.
 *
 * Supports optional `?category=<slug|id>` filtering via URL query param
 * (used by CategoryStrip and breadcrumb links).
 */
export default function ShopPage() {
  const [products, setProducts] = useState<SortingPageProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const { getTemplateId } = useTemplate();
  const searchParams = useSearchParams();

  // Optional category filter from query string
  const categoryParam = searchParams.get("category");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | undefined>(
    undefined,
  );

  // Resolve category slug/id when present
  useEffect(() => {
    if (!categoryParam) {
      setCategoryId(undefined);
      setCategoryName(undefined);
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        const result = await trpc.category.view.query();
        if (cancelled) return;
        if (result.success && result.result) {
          const match = result.result.find(
            (cat: { slug?: string; id: string; name: string }) =>
              cat.slug === categoryParam || cat.id === categoryParam,
          );
          if (match) {
            setCategoryId(match.id);
            setCategoryName(match.name);
          }
        }
      } catch (err) {
        console.error("Error resolving category:", err);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [categoryParam]);

  // Fetch products (all or filtered by category)
  useEffect(() => {
    // Wait for category resolution if param is present
    if (categoryParam && !categoryId) return;

    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await trpc.product.search.query({
          limit: 100,
          includeOutOfStock: true,
          categoryIds: categoryId ? [categoryId] : undefined,
        });

        if (cancelled) return;

        if (result.success && result.result) {
          const mapped: SortingPageProduct[] = result.result.items.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
            stock: p.stock,
            imageUrl: p.imageUrl ?? undefined,
            images: p.images,
            categoryName: p.categoryName || null,
            available: p.stock > 0,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [categoryParam, categoryId]);

  const activeTemplateId = getTemplateId("sorting") ?? "sorting-minimal";
  const TemplateEntry = getTemplateComponent("sorting", activeTemplateId);

  if (!TemplateEntry) {
    return <div>Sorting template not found.</div>;
  }

  const Template = TemplateEntry.component;

  return (
    <div>
      {/* Breadcrumb when filtering by category */}
      {categoryName && (
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 pt-6'>
          <div className='flex items-center gap-2 text-sm text-stone-600 mb-4'>
            <a href='/shop' className='hover:text-stone-900 transition-colors'>
              All Products
            </a>
            <span>/</span>
            <span className='text-stone-900 font-medium'>{categoryName}</span>
          </div>
        </div>
      )}
      <Template
        products={products}
        isLoading={isLoading}
        onSortChange={setSortOption}
        onOpenFilters={() => {}}
        defaultSort={sortOption}
      />
    </div>
  );
}
