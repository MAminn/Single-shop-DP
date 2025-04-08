import { query } from "#root/shared/database/drizzle/db";
import {
  category,
  file,
  product,
  vendor,
  productImage,
} from "#root/shared/database/drizzle/schema";
import { and, eq, ilike, inArray, or, count, gt, sql } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const searchProductsSchema = z.object({
  vendorId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  search: z.string().trim().max(255).optional(),
  limit: z.number().min(1).max(100).optional().default(12),
  offset: z.number().min(0).optional().default(0),
  includeOutOfStock: z.boolean().optional().default(false),
});

export const searchProducts = (input: z.infer<typeof searchProductsSchema>) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        console.log("Searching products with params:", input);

        // Build count query first
        const countQuery = db
          .select({
            count: count(product.id),
          })
          .from(product)
          .where(
            and(
              // Filter by vendor if specified
              input.vendorId ? eq(product.vendorId, input.vendorId) : undefined,
              // Filter by categories if specified
              input.categoryIds && input.categoryIds.length > 0
                ? inArray(product.categoryId, input.categoryIds)
                : undefined,
              // Filter by search term if specified
              input.search
                ? or(
                    ilike(product.name, `%${input.search}%`),
                    ilike(product.description, `%${input.search}%`)
                  )
                : undefined,
              // Include out of stock items if specified
              !input.includeOutOfStock ? gt(product.stock, 0) : undefined
            )
          );

        // Build main query
        const productsQuery = db
          .select({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            imageUrl: file.diskname,
            categoryId: product.categoryId,
            categoryName: category.name,
            vendorId: product.vendorId,
            vendorName: vendor.name,
          })
          .from(product)
          .leftJoin(file, eq(product.imageId, file.id))
          .leftJoin(category, eq(product.categoryId, category.id))
          .leftJoin(vendor, eq(product.vendorId, vendor.id))
          .where(
            and(
              // Filter by vendor if specified
              input.vendorId ? eq(product.vendorId, input.vendorId) : undefined,
              // Filter by categories if specified
              input.categoryIds && input.categoryIds.length > 0
                ? inArray(product.categoryId, input.categoryIds)
                : undefined,
              // Filter by search term if specified
              input.search
                ? or(
                    ilike(product.name, `%${input.search}%`),
                    ilike(product.description, `%${input.search}%`)
                  )
                : undefined,
              // Include out of stock items if specified
              !input.includeOutOfStock ? gt(product.stock, 0) : undefined
            )
          )
          .limit(input.limit)
          .offset(input.offset);

        // Run both queries
        const [totalCount, items] = await Promise.all([
          countQuery,
          productsQuery,
        ]);

        console.log(
          `Found ${items.length} products out of ${totalCount[0]?.count || 0} total`
        );

        // Fetch additional product images for all products
        const productIds = items.map((item) => item.id);

        // Get all product images
        const productImagesQuery = await db
          .select({
            productId: productImage.productId,
            fileId: productImage.fileId,
            isPrimary: productImage.isPrimary,
            diskname: file.diskname,
          })
          .from(productImage)
          .innerJoin(file, eq(productImage.fileId, file.id))
          .where(inArray(productImage.productId, productIds))
          .execute();

        // Process and add available flag to each item
        const processedItems = items.map((item) => {
          // Get all images for this product
          const productImages = productImagesQuery
            .filter((img) => img.productId === item.id)
            .map((img) => ({
              url: img.diskname,
              isPrimary: img.isPrimary,
            }));

          return {
            ...item,
            available: item.stock > 0,
            images:
              productImages.length > 0
                ? productImages
                : item.imageUrl
                  ? [{ url: item.imageUrl, isPrimary: true }]
                  : [],
          };
        });

        return {
          items: processedItems,
          total: totalCount[0]?.count || 0,
        };
      })
    );
  });
