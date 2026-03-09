import { useState, useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "#root/shared/trpc/client";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import type { SortingPageProduct } from "#root/components/template-system/sorting/SortingMinimalTemplate";

/**
 * /categories/@slug – Generic dynamic category page.
 *
 * Resolves a category by its slug, fetches products belonging to that category,
 * and renders the active sorting template.
 */
export default function CategoryPage() {
  const pageContext = usePageContext();
  const slug = pageContext.routeParams?.slug as string;
  const { getTemplateId } = useTemplate();

  const [products, setProducts] = useState<SortingPageProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string | undefined>(
    undefined,
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  // Resolve category slug → id + name
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const resolve = async () => {
      try {
        const result = await trpc.category.view.query();
        if (cancelled) return;

        if (result.success && result.result) {
          const match = result.result.find(
            (cat: { slug?: string; id: string; name: string }) =>
              cat.slug === slug,
          );
          if (match) {
            setCategoryId(match.id);
            setCategoryName(match.name);
            setNotFound(false);
          } else {
            setNotFound(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error resolving category:", err);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fetch products for resolved category
  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await trpc.product.search.query({
          categoryIds: [categoryId],
          limit: 100,
          includeOutOfStock: true,
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
        console.error("Error fetching category products:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  if (notFound) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-stone-900 mb-2'>
            Category Not Found
          </h2>
          <p className='text-stone-600 mb-6'>
            The category you're looking for doesn't exist.
          </p>
          <a
            href='/shop'
            className='inline-flex items-center px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors'>
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  const activeTemplateId = getTemplateId("sorting") ?? "sorting-minimal";
  const TemplateEntry = getTemplateComponent("sorting", activeTemplateId);

  if (!TemplateEntry) {
    return <div>Sorting template not found.</div>;
  }

  const Template = TemplateEntry.component;

  return (
    <div>
      {/* Breadcrumb */}
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
        onSortChange={() => {}}
        onOpenFilters={() => {}}
        defaultSort='featured'
      />
    </div>
  );
}
