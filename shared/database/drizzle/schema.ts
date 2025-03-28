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
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
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
