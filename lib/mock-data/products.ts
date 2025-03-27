export interface Product {
	id: string;
	name: string;
	vendor?: string;
	vendorId?: number;
	price: number;
	stock: number;
	sold?: number;
	sales?: number;
	revenue?: number;
	category?: string;
	status?: string;
	threshold?: number;
	sku?: string;
	imageUrl?: string;
	dateAdded?: Date;
}

export const topProducts: Product[] = [
	{
		id: 1,
		name: "Wireless Earbuds",
		vendor: "Tech Hub",
		vendorId: 2,
		price: 40,
		stock: 45,
		sales: 124,
		revenue: 4960,
		category: "Electronics",
	},
	{
		id: 2,
		name: "Summer Dress",
		vendor: "Fashion Trends",
		vendorId: 1,
		price: 40,
		stock: 32,
		sales: 98,
		revenue: 3920,
		category: "Clothing",
	},
	{
		id: 3,
		name: "Fitness Tracker",
		vendor: "Tech Hub",
		vendorId: 2,
		price: 50,
		stock: 28,
		sales: 87,
		revenue: 4350,
		category: "Electronics",
	},
	{
		id: 4,
		name: "Running Shoes",
		vendor: "Sports Gear",
		vendorId: 4,
		price: 90,
		stock: 40,
		sales: 76,
		revenue: 6840,
		category: "Sports",
	},
];

export const vendorProducts: Product[] = [
	{
		id: 1,
		name: "Denim Jeans",
		price: 40,
		stock: 18,
		sold: 32,
		revenue: 1280,
		category: "Clothing",
	},
	{
		id: 2,
		name: "Leather Jacket",
		price: 100,
		stock: 3,
		sold: 21,
		revenue: 2100,
		category: "Clothing",
		sku: "LJ-001",
		threshold: 5,
	},
	{
		id: 3,
		name: "Cotton T-Shirt",
		price: 30,
		stock: 35,
		sold: 45,
		revenue: 1350,
		category: "Clothing",
	},
	{
		id: 4,
		name: "Winter Boots",
		price: 120,
		stock: 12,
		sold: 16,
		revenue: 1920,
		category: "Footwear",
	},
	{
		id: 5,
		name: "Running Shoes",
		price: 75,
		stock: 2,
		sold: 8,
		revenue: 600,
		category: "Footwear",
		sku: "RS-103",
		threshold: 5,
	},
	{
		id: 6,
		name: "Winter Gloves",
		price: 25,
		stock: 4,
		sold: 12,
		revenue: 300,
		category: "Accessories",
		sku: "WG-022",
		threshold: 8,
	},
];

export const lowStockItems = vendorProducts.filter(
	(p) => p.threshold && p.stock < p.threshold,
);
