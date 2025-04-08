import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const userRole = pgEnum("user_role", ["admin", "vendor", "user"]);

export const user = pgTable("user", {
  id: uuid("id")
    .$defaultFn(() => v7())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordDigest: text("password").notNull(),
  phone: text("phone").notNull(),
  vendorId: uuid("vendor_id").references(() => vendor.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const session = pgTable("session", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  token: text("token").unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const vendorStatus = pgEnum("vendor_status", [
  "pending",
  "rejected",
  "active",
  "inactive",
  "suspended",
  "archived",
]);

export const vendor = pgTable("vendor", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  name: text("name").notNull(),
  status: vendorStatus("status").notNull().default("pending"),
  description: text("description"),
  logoId: uuid("logo_id").references(() => file.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  socialLinks: jsonb("social_links").default([]),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const vendorLogAction = pgEnum("vendor_log_action", [
  "created",
  "updated",
  "approved",
  "rejected",
  "activated",
  "deactivated",
  "suspended",
  "archived",
]);

export const vendorLog = pgTable("vendor_log", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendor.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  note: text("note"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  action: vendorLogAction("action").notNull(),
});

export const file = pgTable("file", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  diskname: text("name").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const categoryType = pgEnum("category_type", ["men", "women"]);

export const category = pgTable("category", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  imageId: uuid("image_id")
    .references(() => file.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .unique(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
  type: categoryType("type").notNull().default("men"),
  deleted: boolean("deleted").notNull().default(false),
});

export const categoryLogAction = pgEnum("category_log_action", [
  "created",
  "updated",
  "deleted",
]);

export const categoryLog = pgTable("category_log", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => category.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  action: categoryLogAction("action").notNull(),
});

export const product = pgTable("product", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageId: uuid("image_id")
    .references(() => file.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => category.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  price: decimal("price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
  vendorId: uuid("vendor_id")
    .references(() => vendor.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  stock: integer("stock").notNull().default(0),
});

export const productVariant = pgTable("product_variant", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  name: text("name").notNull(),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  values: jsonb("values").notNull().default([]).$type<string[]>(),
});

export const orderStatus = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const order = pgTable("order", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  userId: uuid("user_id").references(() => user.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingPostalCode: text("shipping_postal_code").notNull(),
  shippingCountry: text("shipping_country").notNull(),
  subtotal: decimal("subtotal", {
    precision: 10,
    scale: 2,
  }).notNull(),
  shipping: decimal("shipping", {
    precision: 10,
    scale: 2,
  }).notNull(),
  tax: decimal("tax", {
    precision: 10,
    scale: 2,
  }).notNull(),
  total: decimal("total", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: orderStatus("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const orderItem = pgTable("order_item", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendor.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  vendorName: text("vendor_name"),
  quantity: integer("quantity").notNull(),
  price: decimal("price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const productReview = pgTable("product_review", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id").references(() => user.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

// Table to store multiple images for products
export const productImage = pgTable("product_image", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => file.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});
