import { ProductCategory } from "../types";

export const CATEGORIES: ProductCategory[] = [
  {
    id: "myaso-i-ptitsa",
    name: "Мясо и птица",
    subcategories: [
      { id: "beef", name: "Говядина" },
      { id: "pork", name: "Свинина" },
      { id: "lamb", name: "Баранина" },
      { id: "poultry", name: "Птица" },
      { id: "rabbit", name: "Кролик" },
      { id: "offal", name: "Субпродукты" },
      { id: "meat-products", name: "Мясные изделия" }
    ],
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "ryba-i-moreprodukty",
    name: "Рыба и морепродукты",
    subcategories: [
      { id: "fish", name: "Рыба" },
      { id: "caviar", name: "Икра" },
      { id: "seafood", name: "Морепродукты" }
    ],
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "molochka",
    name: "Молочные продукты",
    subcategories: [
      { id: "milk", name: "Молоко" },
      { id: "cheese", name: "Сыры" },
      { id: "cottage-cheese", name: "Творог" },
      { id: "yogurt", name: "Йогурт" },
      { id: "fermented-milk", name: "Кисломолочные" },
      { id: "cream", name: "Сливки" },
      { id: "ice-cream", name: "Мороженое" },
      { id: "dairy", name: "Молочные" }
    ],
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "ovoshchi-i-zen",
    name: "Овощи и зелень",
    subcategories: [
      { id: "cabbage", name: "Капустные" },
      { id: "root-vegetables", name: "Корнеплоды" },
      { id: "fruiting-vegetables", name: "Плодовые" },
      { id: "greens-herbs", name: "Зелень и пряности" },
      { id: "vegetables", name: "Овощи" }
    ],
    image: "https://images.unsplash.com/photo-1512621776951-a57ef244d2ce?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "frukty-i-yagody",
    name: "Фрукты и ягоды",
    subcategories: [
      { id: "pome-fruits", name: "Семечковые" },
      { id: "stone-fruits", name: "Косточковые" },
      { id: "citrus", name: "Цитрусовые" },
      { id: "tropical-fruits", name: "Тропические" },
      { id: "berries-melons", name: "Ягоды и бахчевые" },
      { id: "fruits", name: "Фрукты" }
    ],
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "krupy-i-kashi",
    name: "Крупы и каши",
    subcategories: [
      { id: "rice", name: "Рис" },
      { id: "oats", name: "Овсяные" },
      { id: "buckwheat", name: "Гречневые" },
      { id: "millet", name: "Пшено" },
      { id: "semolina", name: "Манная" },
      { id: "pearl-barley", name: "Перловая" },
      { id: "barley", name: "Ячневая" },
      { id: "corn", name: "Кукурузная" },
      { id: "bulgur", name: "Булгур" },
      { id: "grains", name: "Крупы" }
    ],
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "khleb-i-vypechka",
    name: "Хлеб и выпечка",
    subcategories: [
      { id: "bread", name: "Хлеб" },
      { id: "pasta", name: "Макароны" },
      { id: "crackers", name: "Сухари" },
      { id: "pastries", name: "Выпечка" },
      { id: "flour-products", name: "Мучные изделия" }
    ],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "orekhi-i-sukhofrukty",
    name: "Орехи и сухофрукты",
    subcategories: [
      { id: "nuts", name: "Орехи" },
      { id: "seeds", name: "Семечки" },
      { id: "dried-fruits", name: "Сухофрукты" }
    ],
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "bobovye",
    name: "Бобовые",
    subcategories: [
      { id: "legumes", name: "Бобовые" }
    ],
    image: "https://images.unsplash.com/photo-1590779033100-9f60a05a016d?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "griby",
    name: "Грибы",
    subcategories: [
      { id: "wild-mushrooms", name: "Лесные" },
      { id: "champignons", name: "Шампиньоны" },
      { id: "mushrooms", name: "Грибы" }
    ],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "zhiry-i-masla",
    name: "Жиры и масла",
    subcategories: [
      { id: "oils", name: "Масла" },
      { id: "sauces", name: "Соусы" },
      { id: "fats", name: "Жиры" }
    ],
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "yaytsa",
    name: "Яйца",
    subcategories: [
      { id: "chicken-eggs", name: "Куриные" },
      { id: "egg-white", name: "Белок" },
      { id: "egg-yolk", name: "Желток" },
      { id: "dried-eggs", name: "Сухие" }
    ],
    image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "napitki",
    name: "Напитки",
    subcategories: [
      { id: "juices", name: "Соки" },
      { id: "water", name: "Вода" }
    ],
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "sladosti",
    name: "Сладости",
    subcategories: [
      { id: "chocolate", name: "Шоколад" },
      { id: "sugar", name: "Сахар" },
      { id: "honey", name: "Мед" }
    ],
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop&auto=format&q=75",
  },
  {
    id: "custom",
    name: "Пользовательские",
    subcategories: [
      { id: "user-added", name: "Добавленные пользователем" }
    ],
    image: "",
  },
];

export const ALL_CATEGORY_ID = "all";
