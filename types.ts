export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem extends MacroNutrients {
  id: string;
  name: string;
  servingSize: string;
  timestamp: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
}

export interface UserGoals extends MacroNutrients {
  weightGoal: 'lose' | 'maintain' | 'gain';
  targetWeight: number;
  startWeight: number;
  currentWeight: number;
}

export interface BodyMetrics {
  id: string;
  date: string;
  weight: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  visceralFat?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADD_FOOD = 'ADD_FOOD',
  CAMERA = 'CAMERA',
  BODY_TRACKER = 'BODY_TRACKER',
  SETTINGS = 'SETTINGS',
}