import { ProductCategory } from "../types";

export const CATEGORIES: ProductCategory[] = [
  {
    id: "grains",
    name: "Grains & Cereals",
    subcategories: ["Bread & Bakery", "Rice & Pasta", "Cereals & Oats", "Flour & Starch"],
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "protein",
    name: "Protein Foods",
    subcategories: ["Poultry", "Red Meat", "Fish & Seafood", "Eggs", "Legumes"],
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "dairy",
    name: "Dairy",
    subcategories: ["Milk", "Cheese", "Yogurt & Kefir", "Butter & Cream"],
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "fruits",
    name: "Fruits",
    subcategories: ["Citrus", "Berries", "Tropical", "Stone Fruits", "Dried Fruits"],
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    subcategories: ["Leafy Greens", "Root Vegetables", "Cruciferous", "Alliums", "Other"],
    image: "https://images.unsplash.com/photo-1512621776951-a57ef244d2ce?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "fats",
    name: "Fats & Oils",
    subcategories: ["Oils", "Nuts & Seeds", "Butter", "Other"],
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "beverages",
    name: "Beverages",
    subcategories: ["Water & Sparkling", "Tea & Coffee", "Juices", "Soft Drinks"],
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "snacks",
    name: "Snacks & Sweets",
    subcategories: ["Chips & Crackers", "Chocolate", "Candy", "Bars & Biscuits"],
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "custom",
    name: "Custom",
    subcategories: ["User-added"],
    image: "",
  },
];

export const ALL_CATEGORY_ID = "all";
