export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const mockCategories: Category[] = [
  { id: "1", name: "Men", subcategories: ["Shirts", "Pants", "Shoes"] },
  { id: "2", name: "Women", subcategories: ["Dresses", "Tops", "Accessories"] },
];

export function addCategory(category: Category): void {
  mockCategories.push(category);
}

export function updateCategory(updatedCategory: Category): void {
  const index = mockCategories.findIndex((c) => c.id === updatedCategory.id);
  if (index !== -1) {
    mockCategories[index] = updatedCategory;
  }
}

export function deleteCategory(id: string): void {
  const index = mockCategories.findIndex((c) => c.id === id);
  if (index !== -1) {
    mockCategories.splice(index, 1);
  }
}
