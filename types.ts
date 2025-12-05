
export enum Faction {
  IRON_CLAN = 'Iron Clan',          // Tăng cơ (Build Muscle)
  SHADOW_RUNNER = 'Shadow Runner',  // Giảm mỡ (Lose Fat/Cardio)
  TITAN_TRIBE = 'Titan Tribe',      // Tăng cân (Gain Weight/Bulk)
  BALANCE_ORDER = 'Balance Order'   // Sức khỏe thuần (Maintain/Health)
}

export enum UserClass {
  YOUNG_ADVENTURER = 'Young Adventurer', // 13-17
  ROOKIE_WARRIOR = 'Rookie Warrior',     // 18-24
  ELITE_KNIGHT = 'Elite Knight',         // 25-35
  GUARDIAN = 'Guardian',                 // 36-50
  ELDER_SAGE = 'Elder Sage'              // 50+
}

export enum TrainingStyle {
  CALISTHENICS = 'Calisthenics (Bodyweight)',
  GYM = 'Gym (Weights & Machines)'
}

export enum QuestType {
  WORKOUT = 'WORKOUT',
  NUTRITION = 'NUTRITION',
  LIFESTYLE = 'LIFESTYLE'
}

export enum StatType {
  STR = 'STR', // Strength: Muscle, Compound lifts
  AGI = 'AGI', // Agility: Cardio, HIIT, Flexibility
  VIT = 'VIT', // Vitality: Sleep, Nutrition, Recovery
  INT = 'INT', // Intelligence: Knowledge, Tips
  CHA = 'CHA'  // Charisma: Discipline, Streak, Self-care
}

export enum ExerciseDifficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export interface ExerciseDetail {
  name: string;
  sets: number;
  reps: number;
  muscleGroup?: string;
  instructions?: string[];
  note?: string;
  alternatives?: string[];
  userFeedback?: ExerciseDifficulty;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: QuestType;
  isCompleted: boolean;
  statBonus: StatType;
  relatedExercises?: ExerciseDetail[];
  nutritionMenu?: string[]; // New field for Nutrition quests
}

export interface Challenge {
  id: string;
  title: string;
  lore: string;
  description: string;
  requirements: string;
  difficulty: 'NORMAL' | 'HARD' | 'INSANE';
  xpReward: number;
  type: 'REP_MAX' | 'TIME_MAX' | 'TIME_TRIAL';
}

export interface ChallengeResult {
  date: string;
  challengeTitle: string;
  result: 'VICTORY' | 'DEFEAT';
  record: string;
  xpGained: number;
}

export interface HealthTip {
  id: string;
  date: string;
  content: string;
  category: 'NUTRITION' | 'WORKOUT' | 'MENTAL';
}

export interface WeeklyReview {
  id: string;
  date: string;
  weekStartDate: string;
  totalXP: number;
  questsCompleted: number;
  weightChange: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  evaluation: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  volume: number;
  notificationEnabled: boolean;
}

export interface DailySchedule {
  day: string;
  focus: string;
  exercises: ExerciseDetail[];
}

export interface NutritionPlan {
  dailyCalories: number;
  macroSplit: string;
  meals: string[];
  tips: string[];
}

export interface WeeklyPlan {
  schedule: DailySchedule[];
  nutrition: NutritionPlan;
}

export interface CampaignConfig {
  durationMinutes: number;
  frequencyPerWeek: number;
  targetWeight: number;
  specificGoal: string;
}

export interface StatDetail {
  level: number;
  xp: number;
  maxXP: number;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  
  faction: Faction;
  userClass: UserClass;
  trainingStyle: TrainingStyle;

  level: number;
  currentXP: number;
  maxXP: number;
  streak: number;
  stats: {
    [StatType.STR]: StatDetail;
    [StatType.AGI]: StatDetail; // New
    [StatType.VIT]: StatDetail;
    [StatType.INT]: StatDetail; // New
    [StatType.CHA]: StatDetail; // New
  };
  history: {
    date: string;
    weight: number;
    calories: number;
  }[];
  tipsHistory: HealthTip[];
  weeklyReviews: WeeklyReview[];
  challengeHistory: ChallengeResult[];
  settings: UserSettings;
  campaignConfig?: CampaignConfig;
  activeWeeklyPlan?: WeeklyPlan;
}

export interface DailyPlan {
  date: string;
  quests: Quest[];
  caloriesTarget: number;
  proteinTarget: number;
  workoutFocus: string;
}
