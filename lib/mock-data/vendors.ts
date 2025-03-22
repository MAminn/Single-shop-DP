export interface Vendor {
  id: number;
  name: string;
  owner: string;
  email: string;
  products: number;
  categories: string[];
  joinDate: string;
  status: "Active" | "Pending" | "Suspended";
}

export const vendors: Vendor[] = [
  {
    id: 1,
    name: "Fashion Trends",
    owner: "Emma Johnson",
    email: "emma@fashiontrends.com",
    products: 64,
    categories: ["Clothing", "Accessories"],
    joinDate: "2023-10-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Tech Hub",
    owner: "David Chen",
    email: "david@techhub.com",
    products: 78,
    categories: ["Electronics", "Gadgets"],
    joinDate: "2023-10-12",
    status: "Active",
  },
  {
    id: 3,
    name: "Healthy Foods",
    owner: "Sarah Miller",
    email: "sarah@healthyfoods.com",
    products: 42,
    categories: ["Grocery", "Organic"],
    joinDate: "2023-10-10",
    status: "Pending",
  },
  {
    id: 4,
    name: "Sports World",
    owner: "Michael Brown",
    email: "michael@sportsworld.com",
    products: 51,
    categories: ["Sports", "Fitness"],
    joinDate: "2023-10-05",
    status: "Pending",
  },
  {
    id: 5,
    name: "Home Essentials",
    owner: "Jennifer White",
    email: "jennifer@homeessentials.com",
    products: 89,
    categories: ["Home", "Kitchen"],
    joinDate: "2023-09-28",
    status: "Suspended",
  },
];

export const recentVendors = vendors.slice(0, 4);

export const adminDashboardStats = {
  totalVendors: 18,
  totalProducts: 1245,
  totalOrders: 856,
  totalRevenue: 124580,
  pendingVendors: 3,
};
