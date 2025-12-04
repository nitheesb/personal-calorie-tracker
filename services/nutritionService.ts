import { FoodItem } from "../types";

// Standard Nutrition Response Format
export interface NutritionResponse {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  source: 'api' | 'database';
  brand?: string;
}

// Global Food Database (Indian, Thai, Western, etc.)
// Values are approximations based on standard recipes
const COMMON_FOOD_DB: Record<string, NutritionResponse> = {
  // --- South Indian Gravies & Kolambu ---
  "vatha kuzhambu": { name: "Vatha Kuzhambu", calories: 150, protein: 2, carbs: 18, fat: 8, fiber: 2, servingSize: "1/2 cup", source: 'database' },
  "kara kuzhambu": { name: "Kara Kuzhambu", calories: 140, protein: 2, carbs: 16, fat: 7, fiber: 3, servingSize: "1/2 cup", source: 'database' },
  "more kuzhambu": { name: "More Kuzhambu", calories: 110, protein: 4, carbs: 8, fat: 7, fiber: 0.5, servingSize: "1/2 cup", source: 'database' },
  "sambar": { name: "Sambar", calories: 120, protein: 4, carbs: 14, fat: 5, fiber: 3, servingSize: "1 bowl (200g)", source: 'database' },
  "rasam": { name: "Rasam", calories: 40, protein: 1, carbs: 8, fat: 1, fiber: 0.5, servingSize: "1 bowl", source: 'database' },
  "dal": { name: "Dal Fry", calories: 160, protein: 8, carbs: 20, fat: 5, fiber: 6, servingSize: "1 bowl", source: 'database' },
  "avial": { name: "Avial", calories: 180, protein: 3, carbs: 15, fat: 12, fiber: 5, servingSize: "1 cup", source: 'database' },
  "poriyal": { name: "Veg Poriyal (Coconut)", calories: 110, protein: 3, carbs: 12, fat: 6, fiber: 4, servingSize: "1/2 cup", source: 'database' },
  "kootu": { name: "Veg Kootu", calories: 130, protein: 6, carbs: 14, fat: 5, fiber: 4, servingSize: "1 cup", source: 'database' },
  "fish curry": { name: "Fish Curry (Indian)", calories: 220, protein: 25, carbs: 8, fat: 10, fiber: 2, servingSize: "1 cup", source: 'database' },

  // --- South Indian Staples ---
  "white rice": { name: "White Rice (Cooked)", calories: 205, protein: 4, carbs: 45, fat: 0.5, fiber: 0.6, servingSize: "1 cup (158g)", source: 'database' },
  "brown rice": { name: "Brown Rice (Cooked)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: "1 cup", source: 'database' },
  "idli": { name: "Idli", calories: 39, protein: 2, carbs: 8, fat: 0.2, fiber: 0.2, servingSize: "1 piece (30g)", source: 'database' },
  "dosa": { name: "Plain Dosa", calories: 133, protein: 3.8, carbs: 23, fat: 3.5, fiber: 0.8, servingSize: "1 medium", source: 'database' },
  "masala dosa": { name: "Masala Dosa", calories: 350, protein: 6, carbs: 45, fat: 16, fiber: 3, servingSize: "1 medium", source: 'database' },
  "vada": { name: "Medu Vada", calories: 97, protein: 2.5, carbs: 10, fat: 5.5, fiber: 1.2, servingSize: "1 piece", source: 'database' },
  "curd rice": { name: "Curd Rice", calories: 280, protein: 7, carbs: 40, fat: 10, fiber: 1, servingSize: "1 cup", source: 'database' },
  "lemon rice": { name: "Lemon Rice", calories: 320, protein: 5, carbs: 48, fat: 12, fiber: 2, servingSize: "1 cup", source: 'database' },
  "chicken biryani": { name: "Chicken Biryani", calories: 360, protein: 18, carbs: 45, fat: 12, fiber: 3, servingSize: "1 cup (200g)", source: 'database' },
  "upma": { name: "Rava Upma", calories: 250, protein: 5, carbs: 38, fat: 8, fiber: 2.5, servingSize: "1 cup", source: 'database' },
  "pongal": { name: "Ven Pongal", calories: 310, protein: 8, carbs: 42, fat: 13, fiber: 3, servingSize: "1 cup", source: 'database' },
  "chapati": { name: "Chapati", calories: 104, protein: 3, carbs: 18, fat: 2.5, fiber: 2, servingSize: "1 piece (6 inch)", source: 'database' },
  "poori": { name: "Poori", calories: 140, protein: 3, carbs: 18, fat: 6, fiber: 1, servingSize: "1 piece", source: 'database' },
  
  // --- Breads & Cereals ---
  "wheat bread": { name: "Whole Wheat Bread", calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 4, servingSize: "2 slices", source: 'database' },
  "multigrain bread": { name: "Multigrain Bread", calories: 180, protein: 9, carbs: 30, fat: 3, fiber: 5, servingSize: "2 slices", source: 'database' },
  "quinoa bread": { name: "Quinoa Bread", calories: 90, protein: 4, carbs: 15, fat: 1.5, fiber: 2, servingSize: "1 slice", source: 'database' },
  "corn flakes": { name: "Corn Flakes (Kellogg's)", calories: 100, protein: 2, carbs: 24, fat: 0, fiber: 1, servingSize: "1 cup (30g)", source: 'database', brand: "Kellogg's" },
  "muesli": { name: "Muesli (Fruit & Nut)", calories: 180, protein: 5, carbs: 32, fat: 4, fiber: 4, servingSize: "1/2 cup", source: 'database' },
  "granola": { name: "Granola", calories: 220, protein: 6, carbs: 35, fat: 8, fiber: 4, servingSize: "1/2 cup", source: 'database' },
  "oats": { name: "Oatmeal (Cooked)", calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, servingSize: "1 cup", source: 'database' },

  // --- Salads & Dressings ---
  "salad": { name: "Green Salad (No Dressing)", calories: 25, protein: 1, carbs: 5, fat: 0, fiber: 2, servingSize: "1 bowl", source: 'database' },
  "ranch": { name: "Ranch Dressing", calories: 130, protein: 0, carbs: 2, fat: 13, fiber: 0, servingSize: "2 tbsp", source: 'database' },
  "italian dressing": { name: "Italian Dressing", calories: 80, protein: 0, carbs: 3, fat: 8, fiber: 0, servingSize: "2 tbsp", source: 'database' },
  "olive oil": { name: "Olive Oil", calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, servingSize: "1 tbsp", source: 'database' },
  "vinaigrette": { name: "Balsamic Vinaigrette", calories: 45, protein: 0, carbs: 3, fat: 4, fiber: 0, servingSize: "1 tbsp", source: 'database' },

  // --- Thai & Western ---
  "pad thai": { name: "Pad Thai", calories: 400, protein: 15, carbs: 55, fat: 14, fiber: 3, servingSize: "1 cup", source: 'database' },
  "green curry": { name: "Thai Green Curry (Chicken)", calories: 320, protein: 18, carbs: 12, fat: 22, fiber: 2, servingSize: "1 cup", source: 'database' },
  "tom yum": { name: "Tom Yum Soup", calories: 90, protein: 8, carbs: 10, fat: 3, fiber: 1, servingSize: "1 bowl", source: 'database' },
  "chicken breast": { name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: "100g", source: 'database' },
  "egg": { name: "Boiled Egg", calories: 72, protein: 6.3, carbs: 0.6, fat: 5, fiber: 0, servingSize: "1 large", source: 'database' },
  "pizza": { name: "Pizza Slice (Cheese)", calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, servingSize: "1 slice", source: 'database' },
  "burger": { name: "Cheeseburger", calories: 350, protein: 18, carbs: 35, fat: 16, fiber: 2, servingSize: "1 medium", source: 'database' },
  "pasta": { name: "Pasta (Tomato Sauce)", calories: 250, protein: 8, carbs: 45, fat: 4, fiber: 3, servingSize: "1 cup", source: 'database' },
  "apple": { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, servingSize: "1 medium", source: 'database' },
  "banana": { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: "1 medium", source: 'database' },
  "protein shake": { name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, servingSize: "1 scoop in water", source: 'database' },
  "coffee": { name: "Black Coffee", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, servingSize: "1 cup", source: 'database' },
  "latte": { name: "Cafe Latte", calories: 190, protein: 12, carbs: 18, fat: 9, fiber: 0, servingSize: "1 cup (Whole Milk)", source: 'database' },
};

// 2. OpenFoodFacts API Integration
const OFF_API_URL = "https://world.openfoodfacts.org";

export const fetchProductByBarcode = async (barcode: string): Promise<NutritionResponse | null> => {
  try {
    const response = await fetch(`${OFF_API_URL}/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};
      
      // Attempt to normalize data (often per 100g in OFF)
      return {
        name: p.product_name_en || p.product_name || "Unknown Product",
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        protein: Math.round(nutriments.protein_100g || 0),
        carbs: Math.round(nutriments.carbohydrates_100g || 0),
        fat: Math.round(nutriments.fat_100g || 0),
        fiber: Math.round(nutriments.fiber_100g || 0),
        servingSize: p.serving_size || "100g", 
        source: 'api',
        brand: p.brands
      };
    }
    return null;
  } catch (error) {
    console.error("Barcode fetch error:", error);
    return null;
  }
};

export const searchFoodDatabase = async (query: string): Promise<NutritionResponse[]> => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: NutritionResponse[] = [];

  // 1. Check Local DB first (Exact or partial match)
  Object.keys(COMMON_FOOD_DB).forEach(key => {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      results.push(COMMON_FOOD_DB[key]);
    }
  });

  // 2. If we have less than 3 local results, fallback to OpenFoodFacts search
  if (results.length < 3) {
    try {
      const response = await fetch(`${OFF_API_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        data.products.forEach((p: any) => {
          const nutriments = p.nutriments || {};
          // Only add if we have at least calorie info
          if (nutriments['energy-kcal_100g'] !== undefined || nutriments['energy-kcal'] !== undefined) {
             results.push({
              name: p.product_name_en || p.product_name || "Unknown",
              calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
              protein: Math.round(nutriments.protein_100g || 0),
              carbs: Math.round(nutriments.carbohydrates_100g || 0),
              fat: Math.round(nutriments.fat_100g || 0),
              fiber: Math.round(nutriments.fiber_100g || 0),
              servingSize: p.serving_size || "100g",
              source: 'api',
              brand: p.brands
            });
          }
        });
      }
    } catch (err) {
      console.error("OFF Search Error", err);
    }
  }

  return results;
};