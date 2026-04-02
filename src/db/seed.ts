import { createDb } from "./index.js";
import { users, drinks, ingredients, recipeIngredients, settings, modifiers, tabs, shifts } from "./schema/index.js";

const db = createDb();

console.log("Seeding database...");

// Default settings
db.insert(settings).values({
  id: "default",
  barName: "GustoOSX",
  defaultMarkupFactor: 3.0,
  taxRate: 0,
  enableInventoryTracking: true,
}).onConflictDoNothing().run();

// Admin user (PIN: 1234)
const adminId = "admin-1";
db.insert(users).values({
  id: adminId,
  email: "admin@gustoosx.local",
  pin: "1234",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
}).onConflictDoNothing().run();

// Bartender user (PIN: 0000)
const bartenderId = "bartender-1";
db.insert(users).values({
  id: bartenderId,
  email: "bartender@gustoosx.local",
  pin: "0000",
  firstName: "Bar",
  lastName: "Tender",
  role: "bartender",
}).onConflictDoNothing().run();

// Modifiers
const menuModifiers = [
  { id: "mod-neat", name: "Neat", nameEs: "Directo", price: 0, category: "neat" as const },
  { id: "mod-rocks", name: "On the Rocks", nameEs: "En las Rocas", price: 2, category: "rocks" as const },
  { id: "mod-lime", name: "Add Lime", nameEs: "Con Limón", price: 0, category: "garnish" as const },
  { id: "mod-splash-coke", name: "Splash of Coke", nameEs: "Un poco de Coca", price: 0.5, category: "mixer" as const },
];

for (const mod of menuModifiers) {
  db.insert(modifiers).values(mod).onConflictDoNothing().run();
}

// Shifts
const shiftId = "shift-1";
db.insert(shifts).values({
  id: shiftId,
  name: "Opening Shift",
  status: "active",
  openedByUserId: adminId,
}).onConflictDoNothing().run();

// Tabs
const initialTabs = [
  { id: "tab-1", nickname: "Table 4", staffUserId: bartenderId, shiftId, status: "open" as const },
  { id: "tab-2", nickname: "John Doe", staffUserId: bartenderId, shiftId, status: "open" as const },
];

for (const tab of initialTabs) {
  db.insert(tabs).values(tab).onConflictDoNothing().run();
}

// Ingredients
const spiritIngredients = [
  { id: "teq-casamigos", name: "Casamigos Blanco", nameEs: "Tequila Casamigos Blanco", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 35, currentStock: 1500, minimumStock: 750 },
  { id: "teq-espolon", name: "Espolòn Blanco", nameEs: "Tequila Espolòn Blanco", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 22, currentStock: 2250, minimumStock: 750 },
  { id: "teq-herradura", name: "Herradura Reposado", nameEs: "Tequila Herradura Reposado", category: "spirits" as const, unit: "ml" as const, unitSize: 700, costPerUnit: 30, currentStock: 1400, minimumStock: 700 },
  { id: "vod-smirnoff", name: "Smirnoff Vodka", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 12, currentStock: 2250, minimumStock: 750 },
  { id: "gin-tanqueray", name: "Tanqueray Gin", nameEs: "Ginebra Tanqueray", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 22, currentStock: 1500, minimumStock: 750 },
  { id: "rum-bacardi", name: "Bacardi White Rum", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 11, currentStock: 2250, minimumStock: 750 },
  { id: "whi-jack", name: "Jack Daniels", category: "spirits" as const, unit: "ml" as const, unitSize: 700, costPerUnit: 28, currentStock: 1400, minimumStock: 700 },
  { id: "liq-triple-sec", name: "Triple Sec", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 10, currentStock: 1500, minimumStock: 750 },
  { id: "liq-kahlua", name: "Kahlúa", category: "spirits" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 14, currentStock: 750, minimumStock: 375 },
];

for (const ing of spiritIngredients) {
  db.insert(ingredients).values(ing).onConflictDoNothing().run();
}

// Beers
const beerIngredients = [
  { id: "beer-pacifico", name: "Pacifico Clara", nameEs: "Cerveza Pacífico", category: "beer" as const, unit: "unit" as const, unitSize: 1, costPerUnit: 1.10, currentStock: 48, minimumStock: 24 },
  { id: "beer-corona", name: "Corona Extra", nameEs: "Cerveza Corona", category: "beer" as const, unit: "unit" as const, unitSize: 1, costPerUnit: 1.00, currentStock: 48, minimumStock: 24 },
  { id: "beer-modelo", name: "Modelo Especial", category: "beer" as const, unit: "unit" as const, unitSize: 1, costPerUnit: 1.20, currentStock: 48, minimumStock: 24 },
];

for (const ing of beerIngredients) {
  db.insert(ingredients).values(ing).onConflictDoNothing().run();
}

// Mixers
const mixerIngredients = [
  { id: "mix-lime", name: "Fresh Lime Juice", nameEs: "Jugo de Limón", category: "mixer" as const, unit: "ml" as const, unitSize: 1000, costPerUnit: 2, currentStock: 5000, minimumStock: 2000 },
  { id: "mix-squirt", name: "Squirt", category: "mixer" as const, unit: "ml" as const, unitSize: 2000, costPerUnit: 1.40, currentStock: 10000, minimumStock: 4000 },
  { id: "mix-coke", name: "Coca-Cola", category: "mixer" as const, unit: "ml" as const, unitSize: 2000, costPerUnit: 1.60, currentStock: 10000, minimumStock: 4000 },
  { id: "mix-ginger", name: "Ginger Beer", category: "mixer" as const, unit: "ml" as const, unitSize: 355, costPerUnit: 1.75, currentStock: 4260, minimumStock: 2130 },
  { id: "mix-tonic", name: "Tonic Water", category: "mixer" as const, unit: "ml" as const, unitSize: 355, costPerUnit: 0.90, currentStock: 4260, minimumStock: 2130 },
  { id: "mix-oj", name: "Orange Juice", nameEs: "Jugo de Naranja", category: "mixer" as const, unit: "ml" as const, unitSize: 1000, costPerUnit: 1.25, currentStock: 5000, minimumStock: 2000 },
  { id: "mix-agave", name: "Agave Syrup", nameEs: "Jarabe de Agave", category: "mixer" as const, unit: "ml" as const, unitSize: 750, costPerUnit: 6, currentStock: 1500, minimumStock: 750 },
];

for (const ing of mixerIngredients) {
  db.insert(ingredients).values(ing).onConflictDoNothing().run();
}

// Drinks
const menuDrinks = [
  { id: "marg-classic", name: "Classic Margarita", nameEs: "Margarita Clásica", description: "Tequila, lime, triple sec, agave", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 14 },
  { id: "marg-spicy", name: "Spicy Margarita", nameEs: "Margarita Picante", description: "Tequila, lime, jalapeño", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 15 },
  { id: "paloma", name: "Paloma", description: "Tequila, lime, grapefruit soda", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 13 },
  { id: "mex-mule", name: "Mexican Mule", description: "Tequila, ginger beer, lime", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 15 },
  { id: "mojito", name: "Classic Mojito", description: "Rum, mint, lime, sugar, soda", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 13 },
  { id: "gin-tonic", name: "Gin & Tonic", description: "Tanqueray, tonic, cucumber", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 14 },
  { id: "old-fashioned", name: "Old Fashioned", description: "Whiskey, bitters, orange peel", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 17 },
  { id: "vodka-soda", name: "Vodka Soda", description: "Vodka, sparkling water, lime", category: "cocktail" as const, markupFactor: 3.0, actualPrice: 11 },
  { id: "beer-pacifico", name: "Pacifico", nameEs: "Pacífico", description: "Chilled Pacifico bottle", category: "beer" as const, markupFactor: 2.5, actualPrice: 7 },
  { id: "beer-corona", name: "Corona", description: "Chilled Corona bottle", category: "beer" as const, markupFactor: 2.5, actualPrice: 6 },
  { id: "beer-modelo", name: "Modelo Especial", description: "Chilled Modelo bottle", category: "beer" as const, markupFactor: 2.5, actualPrice: 7 },
  { id: "coke", name: "Coca-Cola", description: "Glass bottle Coke", category: "non_alcoholic" as const, markupFactor: 2.5, actualPrice: 3 },
  { id: "lemonade", name: "Fresh Lemonade", nameEs: "Limonada", description: "Fresh squeezed lime juice", category: "non_alcoholic" as const, markupFactor: 3.0, actualPrice: 4 },
];

for (const drink of menuDrinks) {
  db.insert(drinks).values(drink).onConflictDoNothing().run();
}

// Recipe ingredients
const recipes = [
  { drinkId: "marg-classic", ingredientId: "teq-herradura", amountInMl: 60 },
  { drinkId: "marg-classic", ingredientId: "liq-triple-sec", amountInMl: 30 },
  { drinkId: "marg-classic", ingredientId: "mix-lime", amountInMl: 30 },
  { drinkId: "marg-classic", ingredientId: "mix-agave", amountInMl: 15 },
  { drinkId: "marg-spicy", ingredientId: "teq-espolon", amountInMl: 60 },
  { drinkId: "marg-spicy", ingredientId: "mix-lime", amountInMl: 30 },
  { drinkId: "marg-spicy", ingredientId: "mix-agave", amountInMl: 15 },
  { drinkId: "paloma", ingredientId: "teq-casamigos", amountInMl: 60 },
  { drinkId: "paloma", ingredientId: "mix-lime", amountInMl: 15 },
  { drinkId: "paloma", ingredientId: "mix-squirt", amountInMl: 150 },
  { drinkId: "mex-mule", ingredientId: "teq-casamigos", amountInMl: 60 },
  { drinkId: "mex-mule", ingredientId: "mix-ginger", amountInMl: 150 },
  { drinkId: "mex-mule", ingredientId: "mix-lime", amountInMl: 15 },
  { drinkId: "gin-tonic", ingredientId: "gin-tanqueray", amountInMl: 60 },
  { drinkId: "gin-tonic", ingredientId: "mix-tonic", amountInMl: 150 },
  { drinkId: "old-fashioned", ingredientId: "whi-jack", amountInMl: 60 },
  { drinkId: "vodka-soda", ingredientId: "vod-smirnoff", amountInMl: 60 },
  { drinkId: "beer-pacifico", ingredientId: "beer-pacifico", amountInMl: 1 },
  { drinkId: "beer-corona", ingredientId: "beer-corona", amountInMl: 1 },
  { drinkId: "beer-modelo", ingredientId: "beer-modelo", amountInMl: 1 },
];

for (const r of recipes) {
  db.insert(recipeIngredients).values(r).onConflictDoNothing().run();
}

console.log("Seed complete. Users: admin (PIN: 1234), bartender (PIN: 0000)");
