
import React, { useState } from 'react';
import { UserProfile, CampaignConfig, WeeklyPlan, ExerciseDetail, ExerciseDifficulty } from '../types';
import { generateWeeklyCampaign } from '../services/geminiService';
import { Scroll, Sword, Calendar, Utensils, RefreshCw, ChevronDown, ChevronUp, Dumbbell, Info, CheckCircle2 } from 'lucide-react';
import ExerciseModal from './ExerciseModal';
import { soundEngine } from '../utils/soundEngine';

interface CampaignManagerProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ profile, onUpdateProfile }) => {
  const [config, setConfig] = useState<CampaignConfig>(profile.campaignConfig || {
    durationMinutes: 30,
    frequencyPerWeek: 4,
    targetWeight: profile.targetWeight || profile.weight,
    specificGoal: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WeeklyPlan | undefined>(profile.activeWeeklyPlan);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  // Track selected exercise with its location in the array to allow updates
  const [selectedExData, setSelectedExData] = useState<{data: ExerciseDetail, dayIdx: number, exIdx: number} | null>(null);

  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      soundEngine.playClick();
      const newPlan = await generateWeeklyCampaign(profile, config);
      setPlan(newPlan);
      
      const updatedProfile = {
        ...profile,
        targetWeight: config.targetWeight,
        campaignConfig: config,
        activeWeeklyPlan: newPlan
      };
      onUpdateProfile(updatedProfile);
      soundEngine.playLevelUp();
    } catch (error) {
      console.error(error);
      alert("Không thể triệu hồi chiến thuật lúc này. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (idx: number) => {
    setExpandedDay(expandedDay === idx ? null : idx);
  };

  const updatePlan = (newPlan: WeeklyPlan) => {
    setPlan(newPlan);
    const updatedProfile = { ...profile, activeWeeklyPlan: newPlan };
    onUpdateProfile(updatedProfile);
  };

  const handleSwapExercise = (alternativeName: string) => {
    if (!selectedExData || !plan) return;
    const { dayIdx, exIdx, data } = selectedExData;
    
    // Create a deep copy of the plan
    const newPlan = JSON.parse(JSON.stringify(plan)) as WeeklyPlan;
    
    // Swap the name. We keep other stats but clear specific instructions as they might not match perfectly
    // Ideally, we'd query API again, but for speed, we swap metadata.
    newPlan.schedule[dayIdx].exercises[exIdx] = {
      ...data,
      name: alternativeName,
      instructions: [], // Clear old instructions
      alternatives: data.alternatives?.filter(a => a !== alternativeName).concat([data.name]) // Swap current name into alternatives
    };

    updatePlan(newPlan);
    setSelectedExData({ ...selectedExData, data: newPlan.schedule[dayIdx].exercises[exIdx] });
    soundEngine.playClick();
  };

  const handleRateExercise = (rating: ExerciseDifficulty) => {
     if (!selectedExData || !plan) return;
     const { dayIdx, exIdx } = selectedExData;

     const newPlan = JSON.parse(JSON.stringify(plan)) as WeeklyPlan;
     newPlan.schedule[dayIdx].exercises[exIdx].userFeedback = rating;

     updatePlan(newPlan);
     setSelectedExData({ ...selectedExData, data: newPlan.schedule[dayIdx].exercises[exIdx] });
     soundEngine.playSuccess();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Modal for Exercise Details */}
      {selectedExData && (
        <ExerciseModal 
          exercise={selectedExData.data} 
          onClose={() => setSelectedExData(null)}
          onSwapExercise={handleSwapExercise}
          onRateExercise={handleRateExercise}
        />
      )}

      {/* Configuration Section */}
      <div className="bg-rpg-panel border border-slate-600 rounded-xl p-6 shadow-lg">
        <h3 className="font-rpg text-xl text-rpg-gold mb-4 flex items-center gap-2">
          <Scroll size={24} /> Thiết Lập Chiến Dịch
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Thời gian mỗi trận chiến (phút)</label>
              <div className="flex gap-2">
                {[10, 20, 30, 50].map(min => (
                  <button
                    key={min}
                    onClick={() => setConfig({...config, durationMinutes: min as any})}
                    className={`flex-1 py-2 px-3 rounded border text-sm font-bold transition-all ${
                      config.durationMinutes === min
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {min}p
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Tần suất tham chiến (ngày/tuần)</label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    onClick={() => setConfig({...config, frequencyPerWeek: day as any})}
                    className={`flex-1 py-2 px-3 rounded border text-sm font-bold transition-all ${
                      config.frequencyPerWeek === day
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Mục tiêu cân nặng (kg)</label>
              <input 
                type="number" 
                value={config.targetWeight}
                onChange={(e) => setConfig({...config, targetWeight: parseFloat(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-rpg-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Ghi chú đặc biệt (Ví dụ: Tập trung cơ bụng)</label>
              <input 
                type="text" 
                value={config.specificGoal}
                onChange={(e) => setConfig({...config, specificGoal: e.target.value})}
                placeholder="Nhập yêu cầu..."
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-rpg-gold outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleCreateCampaign}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-rpg-xp to-purple-600 text-white font-rpg font-bold text-lg py-3 rounded hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Sword />} 
          {plan ? "Tái Thiết Lập Chiến Thuật" : "Khởi Tạo Chiến Thuật"}
        </button>
      </div>

      {/* Results Section */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Schedule */}
          <div className="md:col-span-7 bg-rpg-panel border border-slate-600 rounded-xl p-6">
            <h3 className="font-rpg text-xl text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="text-rpg-gold" /> Giáo Án Chi Tiết
            </h3>
            <div className="space-y-3">
              {plan.schedule.map((day, dayIdx) => (
                <div key={dayIdx} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div 
                    onClick={() => toggleDay(dayIdx)}
                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-rpg-accent w-16">{day.day}</span>
                        <span className="text-sm text-slate-300 font-semibold">{day.focus}</span>
                    </div>
                    {expandedDay === dayIdx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                  
                  {expandedDay === dayIdx && (
                    <div className="p-3 bg-slate-900/50 border-t border-slate-700 space-y-2">
                      {/* Check if exercises are strings or objects (migration safety) */}
                      {day.exercises.map((ex: any, exIdx) => (
                         <div 
                           key={exIdx} 
                           onClick={() => typeof ex !== 'string' && setSelectedExData({ data: ex, dayIdx, exIdx })}
                           className="flex items-start gap-3 p-2 rounded bg-slate-800/50 hover:bg-slate-700 border border-transparent hover:border-rpg-gold/50 cursor-pointer transition-all group relative"
                         >
                             <div className="mt-1">
                                {ex.userFeedback ? (
                                   <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                   <Dumbbell size={16} className="text-slate-500 group-hover:text-rpg-gold" />
                                )}
                             </div>
                             
                             <div className="flex-1">
                                {typeof ex === 'string' ? (
                                    <div className="text-slate-300 text-sm">{ex}</div>
                                ) : (
                                    <>
                                      <div className="text-slate-200 font-medium text-sm flex justify-between items-center">
                                         <span className="group-hover:text-white">{ex.name}</span>
                                         <div className="flex items-center gap-2">
                                            <span className="text-rpg-gold text-xs font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                                {ex.sets} x {ex.reps}
                                            </span>
                                            <Info size={14} className="text-slate-600 group-hover:text-blue-400" />
                                         </div>
                                      </div>
                                      {ex.note && <div className="text-xs text-slate-500 mt-0.5 italic">{ex.note}</div>}
                                    </>
                                )}
                             </div>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div className="md:col-span-5 bg-rpg-panel border border-slate-600 rounded-xl p-6 flex flex-col">
            <h3 className="font-rpg text-xl text-slate-200 mb-4 flex items-center gap-2">
              <Utensils className="text-emerald-500" /> Tiếp Tế & Dinh Dưỡng
            </h3>
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4 text-center">
              <div className="text-slate-400 text-sm mb-1">Tổng Calories Mỗi Ngày</div>
              <div className="text-3xl font-bold text-emerald-400 font-rpg">{plan.nutrition.dailyCalories} kcal</div>
              <div className="text-xs text-slate-500 mt-1">{plan.nutrition.macroSplit}</div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h4 className="text-slate-300 font-bold text-sm mb-2 border-b border-slate-700 pb-1">Thực Đơn Mẫu</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  {plan.nutrition.meals.map((meal, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500">•</span> {meal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-slate-300 font-bold text-sm mb-2 border-b border-slate-700 pb-1">Lời Khuyên</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  {plan.nutrition.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-rpg-gold">★</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
