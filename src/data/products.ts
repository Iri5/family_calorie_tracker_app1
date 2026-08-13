import { Product } from "../types";

export const DEFAULT_PRODUCTS: Product[] = [
  // Grains
  { id: "dp01", name: "White Rice", description: "Cooked", category: "grains", subcategory: "Rice & Pasta", calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2, isCustom: false },
  { id: "dp02", name: "Brown Rice", description: "Cooked", category: "grains", subcategory: "Rice & Pasta", calories: 123, protein: 2.7, fat: 1, carbs: 25.6, isCustom: false },
  { id: "dp03", name: "Pasta", description: "Cooked", category: "grains", subcategory: "Rice & Pasta", calories: 157, protein: 5.8, fat: 0.9, carbs: 30.9, isCustom: false },
  { id: "dp04", name: "White Bread", description: "Sliced", category: "grains", subcategory: "Bread & Bakery", calories: 265, protein: 9, fat: 3.2, carbs: 49, isCustom: false },
  { id: "dp05", name: "Whole-Wheat Bread", description: "Sliced", category: "grains", subcategory: "Bread & Bakery", calories: 247, protein: 12.6, fat: 3.4, carbs: 41, isCustom: false },
  { id: "dp06", name: "Oatmeal", description: "Cooked with water", category: "grains", subcategory: "Cereals & Oats", calories: 71, protein: 2.5, fat: 1.5, carbs: 12, isCustom: false, barcode: "0012345678929" },
  { id: "dp07", name: "Cornflakes", description: "Plain, dry", category: "grains", subcategory: "Cereals & Oats", calories: 357, protein: 7.5, fat: 0.4, carbs: 84, isCustom: false },

  // Protein
  { id: "dp08", name: "Chicken Breast", description: "Cooked, skinless", category: "protein", subcategory: "Poultry", calories: 165, protein: 31, fat: 3.6, carbs: 0, isCustom: false, barcode: "0012345678905" },
  { id: "dp09", name: "Chicken Thigh", description: "Cooked, skinless", category: "protein", subcategory: "Poultry", calories: 209, protein: 26, fat: 11, carbs: 0, isCustom: false },
  { id: "dp10", name: "Ground Beef", description: "80% lean, cooked", category: "protein", subcategory: "Red Meat", calories: 254, protein: 17.2, fat: 20, carbs: 0, isCustom: false },
  { id: "dp11", name: "Beef Steak", description: "Lean, grilled", category: "protein", subcategory: "Red Meat", calories: 214, protein: 26.2, fat: 11.8, carbs: 0, isCustom: false },
  { id: "dp12", name: "Salmon", description: "Atlantic, cooked", category: "protein", subcategory: "Fish & Seafood", calories: 208, protein: 20.4, fat: 13.4, carbs: 0, isCustom: false },
  { id: "dp13", name: "Tuna", description: "Canned in water", category: "protein", subcategory: "Fish & Seafood", calories: 116, protein: 25.5, fat: 1, carbs: 0, isCustom: false },
  { id: "dp14", name: "Eggs", description: "Whole, large", category: "protein", subcategory: "Eggs", calories: 155, protein: 12.6, fat: 11, carbs: 1.1, isCustom: false, barcode: "0012345678912" },
  { id: "dp15", name: "Lentils", description: "Cooked", category: "protein", subcategory: "Legumes", calories: 116, protein: 9, fat: 0.4, carbs: 20, isCustom: false },
  { id: "dp16", name: "Chickpeas", description: "Cooked", category: "protein", subcategory: "Legumes", calories: 164, protein: 8.9, fat: 2.6, carbs: 27.4, isCustom: false },

  // Dairy
  { id: "dp17", name: "Whole Milk", description: "3.25% fat", category: "dairy", subcategory: "Milk", calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, isCustom: false },
  { id: "dp18", name: "Greek Yogurt", description: "Plain, 0% fat", category: "dairy", subcategory: "Yogurt & Kefir", calories: 59, protein: 10.2, fat: 0.4, carbs: 3.6, isCustom: false },
  { id: "dp19", name: "Cheddar Cheese", description: "Full fat", category: "dairy", subcategory: "Cheese", calories: 402, protein: 24.9, fat: 33.1, carbs: 1.3, isCustom: false },
  { id: "dp20", name: "Cottage Cheese", description: "Low fat", category: "dairy", subcategory: "Cheese", calories: 98, protein: 11.1, fat: 4.3, carbs: 3.4, isCustom: false },
  { id: "dp21", name: "Butter", description: "Unsalted", category: "dairy", subcategory: "Butter & Cream", calories: 717, protein: 0.9, fat: 81.1, carbs: 0.1, isCustom: false },

  // Fruits
  { id: "dp22", name: "Banana", description: "Fresh, peeled", category: "fruits", subcategory: "Tropical", calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, isCustom: false },
  { id: "dp23", name: "Apple", description: "Fresh, with skin", category: "fruits", subcategory: "Stone Fruits", calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, isCustom: false },
  { id: "dp24", name: "Orange", description: "Fresh, peeled", category: "fruits", subcategory: "Citrus", calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, isCustom: false },
  { id: "dp25", name: "Strawberries", description: "Fresh", category: "fruits", subcategory: "Berries", calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, isCustom: false },
  { id: "dp26", name: "Blueberries", description: "Fresh", category: "fruits", subcategory: "Berries", calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, isCustom: false },

  // Vegetables
  { id: "dp27", name: "Broccoli", description: "Raw", category: "vegetables", subcategory: "Cruciferous", calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, isCustom: false },
  { id: "dp28", name: "Spinach", description: "Raw", category: "vegetables", subcategory: "Leafy Greens", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, isCustom: false },
  { id: "dp29", name: "Sweet Potato", description: "Baked with skin", category: "vegetables", subcategory: "Root Vegetables", calories: 86, protein: 1.6, fat: 0.1, carbs: 20, isCustom: false },
  { id: "dp30", name: "Carrot", description: "Raw", category: "vegetables", subcategory: "Root Vegetables", calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, isCustom: false },
  { id: "dp31", name: "Cucumber", description: "Raw, with skin", category: "vegetables", subcategory: "Other", calories: 15, protein: 0.6, fat: 0.1, carbs: 3.6, isCustom: false },

  // Fats & Oils
  { id: "dp32", name: "Olive Oil", description: "Extra virgin", category: "fats", subcategory: "Oils", calories: 884, protein: 0, fat: 100, carbs: 0, isCustom: false },
  { id: "dp33", name: "Almonds", description: "Raw, unsalted", category: "fats", subcategory: "Nuts & Seeds", calories: 579, protein: 21.2, fat: 49.9, carbs: 21.6, isCustom: false },
  { id: "dp34", name: "Avocado", description: "Fresh", category: "fats", subcategory: "Other", calories: 160, protein: 2, fat: 14.7, carbs: 8.5, isCustom: false },
  { id: "dp35", name: "Peanut Butter", description: "Natural, no added sugar", category: "fats", subcategory: "Nuts & Seeds", calories: 588, protein: 25, fat: 50, carbs: 20, isCustom: false },

  // Beverages
  { id: "dp36", name: "Orange Juice", description: "Fresh squeezed", category: "beverages", subcategory: "Juices", calories: 45, protein: 0.7, fat: 0.2, carbs: 10.4, isCustom: false },
  { id: "dp37", name: "Whole Milk (drink)", description: "Ready to drink", category: "beverages", subcategory: "Other", calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, isCustom: false },

  // Snacks
  { id: "dp38", name: "Dark Chocolate", description: "70–85% cacao", category: "snacks", subcategory: "Chocolate", calories: 598, protein: 7.8, fat: 43, carbs: 46, isCustom: false },
];
