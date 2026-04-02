import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

const uuid = () => randomUUID();

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(uuid),
  email: text("email").unique(),
  pin: text("pin").notNull().default("0000"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: ["admin", "manager", "bartender", "server"] }).notNull().default("bartender"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const ingredients = sqliteTable("ingredients", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  category: text("category", { enum: ["spirits", "beer", "wine", "mixer", "garnish", "other"] }).notNull().default("other"),
  unit: text("unit", { enum: ["ml", "oz", "unit"] }).notNull(),
  unitSize: real("unit_size").notNull(),
  costPerUnit: real("cost_per_unit").notNull(),
  currentStock: real("current_stock").notNull().default(0),
  minimumStock: real("minimum_stock").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const drinks = sqliteTable("drinks", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  description: text("description"),
  descriptionEs: text("description_es"),
  category: text("category", { enum: ["cocktail", "beer", "wine", "shot", "non_alcoholic", "food", "other"] }).notNull().default("other"),
  markupFactor: real("markup_factor").notNull().default(3.0),
  upcharge: real("upcharge").notNull().default(0),
  actualPrice: real("actual_price"),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: text("id").primaryKey().$defaultFn(uuid),
  drinkId: text("drink_id").notNull().references(() => drinks.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id").notNull().references(() => ingredients.id, { onDelete: "restrict" }),
  amountInMl: real("amount_in_ml").notNull(),
});

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "closed"] }).notNull().default("active"),
  openedByUserId: text("opened_by_user_id").notNull().references(() => users.id),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const tabs = sqliteTable("tabs", {
  id: text("id").primaryKey().$defaultFn(uuid),
  nickname: text("nickname").notNull(),
  status: text("status", { enum: ["open", "closed", "transferred"] }).notNull().default("open"),
  staffUserId: text("staff_user_id").notNull().references(() => users.id),
  shiftId: text("shift_id").references(() => shifts.id),
  tableNumber: text("table_number"),
  keepCard: integer("keep_card", { mode: "boolean" }).notNull().default(false),
  totalAmount: real("total_amount").notNull().default(0),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "split"] }),
  notes: text("notes"),
  openedAt: integer("opened_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const modifiers = sqliteTable("modifiers", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  nameEs: text("name_es"),
  price: real("price").notNull().default(0),
  category: text("category", { enum: ["neat", "rocks", "mixer", "garnish", "other"] }).notNull().default("other"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(uuid),
  tabId: text("tab_id").notNull().references(() => tabs.id, { onDelete: "cascade" }),
  drinkId: text("drink_id").notNull().references(() => drinks.id),
  drinkName: text("drink_name").notNull(),
  drinkNameEs: text("drink_name_es"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  modifiers: text("modifiers"), // JSON string of applied modifiers
  notes: text("notes"),
  voided: integer("voided", { mode: "boolean" }).notNull().default(false),
  voidedBy: text("voided_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("default"),
  barName: text("bar_name").notNull().default("GustoOSX"),
  defaultMarkupFactor: real("default_markup_factor").notNull().default(3.0),
  taxRate: real("tax_rate").notNull().default(0),
  enableInventoryTracking: integer("enable_inventory_tracking", { mode: "boolean" }).notNull().default(true),
  printerEnabled: integer("printer_enabled", { mode: "boolean" }).notNull().default(false),
  printerDevice: text("printer_device"),
  cashDrawerEnabled: integer("cash_drawer_enabled", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;
export type Drink = typeof drinks.$inferSelect;
export type InsertDrink = typeof drinks.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = typeof recipeIngredients.$inferInsert;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;
export type Tab = typeof tabs.$inferSelect;
export type InsertTab = typeof tabs.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type Modifier = typeof modifiers.$inferSelect;
export type InsertModifier = typeof modifiers.$inferInsert;
