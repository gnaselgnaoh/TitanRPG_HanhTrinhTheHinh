
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, QuestType, StatType, DailyPlan, HealthTip, WeeklyReview, CampaignConfig, WeeklyPlan, Challenge, TrainingStyle, Faction, UserClass } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to translate Faction/Class to Prompt Context
const getContextFromProfile = (profile: UserProfile) => {
  let factionGoal = "";
  switch(profile.faction) {
    case Faction.IRON_CLAN: factionGoal = "Tối đa hóa cơ bắp (Hypertrophy), nâng tạ nặng, ăn nhiều đạm."; break;
    case Faction.SHADOW_RUNNER: factionGoal = "Giảm mỡ, tăng sức bền (Cardio/Endurance), thâm hụt calo, nhanh nhẹn."; break;
    case Faction.TITAN_TRIBE: factionGoal = "Tăng cân, tăng kích thước cơ thể (Bulking), ăn dư calo."; break;
    case Faction.BALANCE_ORDER: factionGoal = "Duy trì sức khỏe, cân bằng, dẻo dai, giữ dáng."; break;
  }

  let classFocus = "";
  switch(profile.userClass) {
    case UserClass.YOUNG_ADVENTURER: classFocus = "Tuổi 13-17: Đang phát triển. Ưu tiên Calisthenics, Cardio, dinh dưỡng phát triển chiều cao. Tránh nén cột sống quá nặng."; break;
    case UserClass.ROOKIE_WARRIOR: classFocus = "Tuổi 18-24: Đỉnh cao testosterone. Tập cường độ cao, tăng cơ nhanh, thử thách giới hạn."; break;
    case UserClass.ELITE_KNIGHT: classFocus = "Tuổi 25-35: Ổn định. Tập trung kiểm soát mỡ bụng, cân bằng công việc/tập luyện, hormone."; break;
    case UserClass.GUARDIAN: classFocus = "Tuổi 36-50: Bền bỉ. Tập trung sức bền, bảo vệ tim mạch, giãn cơ, ngủ đủ giấc."; break;
    case UserClass.ELDER_SAGE: classFocus = "Tuổi 50+: An toàn là trên hết. Yoga, đi bộ, bài tập nhẹ nhàng, dinh dưỡng sạch."; break;
  }

  return `
    Môn phái (Faction): ${profile.faction} - Mục tiêu: ${factionGoal}.
    Lớp nhân vật (Class): ${profile.userClass} - Đặc điểm: ${classFocus}.
    Trường phái tập: ${profile.trainingStyle}.
  `;
};

export const generateDailyQuests = async (profile: UserProfile): Promise<DailyPlan> => {
  const context = getContextFromProfile(profile);

  // Xác định rõ ràng ràng buộc về dụng cụ tập luyện
  let styleInstruction = "";
  if (profile.trainingStyle === TrainingStyle.CALISTHENICS) {
    styleInstruction = "BẮT BUỘC: Người dùng chọn CALISTHENICS. Các bài tập WORKOUT PHẢI là bài tập trọng lượng cơ thể (Push-ups, Pull-ups, Dips, Squats, Lunges, Plank, Burpees...). TUYỆT ĐỐI KHÔNG ĐƯỢC tạo nhiệm vụ yêu cầu tạ đơn, tạ đòn hay máy tập gym.";
  } else {
    styleInstruction = "BẮT BUỘC: Người dùng chọn GYM. Các bài tập WORKOUT nên ưu tiên sử dụng tạ đơn, tạ đòn, máy tập (Bench Press, Deadlift, Squat rack, Lat pulldown, Dumbbell curls...).";
  }

  const prompt = `
    Bạn là Guild Master RPG. Tạo Daily Quests cho Hero: ${profile.name} (${profile.userClass}, ${profile.faction}).
    
    THÔNG TIN CONTEXT:
    ${context}

    QUY TẮC BÀI TẬP (QUAN TRỌNG):
    ${styleInstruction}
    
    HỆ THỐNG STATS MỚI (Phân loại nhiệm vụ theo stats):
    - STR: Nhiệm vụ sức mạnh, tạ, compound (Nếu là Gym) hoặc biến thể khó của bodyweight (Nếu là Calisthenics).
    - AGI: Nhiệm vụ cardio, chạy bộ, HIIT, giãn cơ.
    - VIT: Nhiệm vụ ăn uống, ngủ, uống nước.
    - INT: Nhiệm vụ tìm hiểu kiến thức, đọc tips.
    - CHA: Nhiệm vụ kỷ luật, check-in, tinh thần.

    YÊU CẦU ĐẶC BIỆT:
    1. Nếu là nhiệm vụ NUTRITION (VIT), bắt buộc phải có trường 'nutritionMenu' gợi ý thực đơn cụ thể cho bữa ăn đó phù hợp với Calories/Protein Target.
    2. Nếu là nhiệm vụ WORKOUT, phải có 'relatedExercises' chi tiết.
    3. QUAN TRỌNG: TOÀN BỘ NỘI DUNG OUTPUT PHẢI LÀ TIẾNG VIỆT 100% (Tiêu đề, Mô tả, Tên món ăn, Hướng dẫn, Ghi chú...). Không sử dụng tiếng Anh trừ tên riêng chuyên ngành không thể dịch.

    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            caloriesTarget: { type: Type.NUMBER },
            proteinTarget: { type: Type.NUMBER },
            workoutFocus: { type: Type.STRING },
            quests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  xpReward: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["WORKOUT", "NUTRITION", "LIFESTYLE"] },
                  isCompleted: { type: Type.BOOLEAN },
                  statBonus: { type: Type.STRING, enum: ["STR", "AGI", "VIT", "INT", "CHA"] },
                  nutritionMenu: { type: Type.ARRAY, items: { type: Type.STRING } },
                  relatedExercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         name: { type: Type.STRING },
                         sets: { type: Type.NUMBER },
                         reps: { type: Type.NUMBER },
                         muscleGroup: { type: Type.STRING },
                         instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                         note: { type: Type.STRING }
                      },
                      required: ["name", "sets", "reps"]
                    }
                  }
                },
                required: ["id", "title", "description", "xpReward", "type", "isCompleted", "statBonus"]
              }
            }
          },
          required: ["date", "caloriesTarget", "proteinTarget", "workoutFocus", "quests"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    return JSON.parse(jsonText) as DailyPlan;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      date: new Date().toISOString().split('T')[0],
      caloriesTarget: 2000,
      proteinTarget: 100,
      workoutFocus: "Hồi phục cơ bản",
      quests: [
        {
          id: "fallback-1",
          title: "Thiền định hồi phục",
          description: "Hệ thống AI đang bảo trì. Hãy nghỉ ngơi để hồi phục năng lượng.",
          xpReward: 10,
          type: QuestType.LIFESTYLE,
          isCompleted: false,
          statBonus: StatType.VIT,
          relatedExercises: []
        }
      ]
    };
  }
};

export const generateDailyTip = async (profile: UserProfile): Promise<HealthTip> => {
  const context = getContextFromProfile(profile);
  const prompt = `
    Đưa ra lời khuyên ngắn (dưới 30 từ) bằng TIẾNG VIỆT cho:
    ${context}
    Phong cách: Lời sấm truyền cổ đại từ Oracle. Tăng chỉ số INT.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             content: { type: Type.STRING },
             category: { type: Type.STRING, enum: ['NUTRITION', 'WORKOUT', 'MENTAL'] }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: data.content || "Kiến thức là sức mạnh.",
      category: data.category || 'MENTAL'
    };
  } catch (e) {
    return { id: Date.now().toString(), date: "", content: "Uống nước đi chiến binh.", category: 'NUTRITION' };
  }
};

export const generateWeeklyReview = async (profile: UserProfile): Promise<WeeklyReview> => {
  const prompt = `
    Đánh giá tuần của ${profile.name} bằng TIẾNG VIỆT.
    Level: ${profile.level}.
    Cân nặng: ${profile.weight}kg.
    
    Viết nhận xét ngắn (dưới 50 từ). Rank: S/A/B/C/D.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evaluation: { type: Type.STRING },
          rank: { type: Type.STRING, enum: ['S', 'A', 'B', 'C', 'D'] }
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    weekStartDate: "",
    totalXP: profile.currentXP,
    questsCompleted: 0, 
    weightChange: 0,
    rank: data.rank || 'B',
    evaluation: data.evaluation || "Tiếp tục cố gắng."
  };
};

export const consultOracle = async (query: string, profile: UserProfile): Promise<string> => {
  const context = getContextFromProfile(profile);
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `Bạn là Oracle. Context: ${context}. Trả lời ngắn gọn bằng TIẾNG VIỆT.`
      }
    });
    const result = await chat.sendMessage({ message: query });
    return result.text || "...";
  } catch (e) {
    return "Oracle đang bận.";
  }
};

export const generateWeeklyCampaign = async (profile: UserProfile, config: CampaignConfig): Promise<WeeklyPlan> => {
  // Simple pass-through for now as user removed Campaign Manager mostly, 
  // but kept for compatibility if re-enabled.
  return { schedule: [], nutrition: { dailyCalories: 0, macroSplit: '', meals: [], tips: [] } };
};

export const generateBossChallenge = async (profile: UserProfile): Promise<Challenge> => {
  const context = getContextFromProfile(profile);
  
  // Xác định rõ ràng ràng buộc về dụng cụ tập luyện cho Boss
  let styleInstruction = "";
  if (profile.trainingStyle === TrainingStyle.CALISTHENICS) {
    styleInstruction = "QUAN TRỌNG: Người dùng tập CALISTHENICS. Thử thách BOSS PHẢI là các bài tập Bodyweight (VD: Max Push-ups, Max Plank time, 100 Burpees, Squat jumps...). KHÔNG ĐƯỢC yêu cầu tạ.";
  } else {
    styleInstruction = "QUAN TRỌNG: Người dùng tập GYM. Thử thách có thể là Gym (VD: Bench Press bodyweight AMRAP) hoặc Bodyweight conditioning.";
  }

  const prompt = `
    Tạo WEEKLY BOSS (Trùm Cuối Tuần) cho:
    ${context}
    
    ${styleInstruction}

    Đây là bài kiểm tra thể lực tổng hợp.
    Độ khó: Dựa trên UserClass. 
    Yêu cầu: Phải rất khó nhưng khả thi để test giới hạn (Max Reps, Max Time).
    Cốt truyện: Một con quái vật đại diện cho sự lười biếng hoặc thử thách thể chất.
    Ngôn ngữ: Tiếng Việt.

    JSON Format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lore: { type: Type.STRING },
            description: { type: Type.STRING },
            requirements: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['NORMAL', 'HARD', 'INSANE'] },
            xpReward: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['REP_MAX', 'TIME_MAX', 'TIME_TRIAL'] }
          },
          required: ["title", "lore", "description", "requirements", "difficulty", "xpReward", "type"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { id: Date.now().toString(), ...data };
  } catch (error) {
    return {
       id: Date.now().toString(),
       title: "Bóng Ma Lười Biếng",
       lore: "Một thế lực đen tối đang cố gắng giữ bạn trên giường ngủ.",
       description: "Burpees trong 5 phút.",
       requirements: "Trên 30 cái",
       difficulty: "HARD",
       xpReward: 500,
       type: "REP_MAX"
    };
  }
};
