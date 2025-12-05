
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPlan, WeeklyReview, UserSettings, Challenge, ChallengeResult, StatType, TrainingStyle, Faction } from '../types';
import HeroCard from './HeroCard';
import QuestBoard from './QuestBoard';
import OracleChat from './OracleChat';
import HealthTipsLog from './HealthTipsLog';
import WeeklyReport from './WeeklyReport';
import SettingsModal from './SettingsModal';
import ChallengeModal from './ChallengeModal';
import { generateDailyQuests, generateDailyTip, generateWeeklyReview, generateBossChallenge } from '../services/geminiService';
import { soundEngine } from '../utils/soundEngine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, Activity, BookHeart, Crown, Settings, Skull, Swords } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, setProfile, onReset }) => {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentReview, setCurrentReview] = useState<WeeklyReview | null>(null);
  
  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // Sync SoundEngine with user settings on load
  useEffect(() => {
    soundEngine.setEnabled(profile.settings.soundEnabled);
  }, [profile.settings.soundEnabled]);

  // Initialize Data (Plan, Tip, Weekly Review)
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Daily Plan
      const storedPlan = localStorage.getItem(`titan_plan_${today}`);
      if (storedPlan) {
        setPlan(JSON.parse(storedPlan));
      } else {
        const newPlan = await generateDailyQuests(profile);
        setPlan(newPlan);
        localStorage.setItem(`titan_plan_${today}`, JSON.stringify(newPlan));
      }

      // 2. Daily Tip Check
      const hasTipToday = profile.tipsHistory?.some(t => t.date === today);
      if (!hasTipToday) {
         const newTip = await generateDailyTip(profile);
         // Update profile with the new tip immediately
         const updatedHistory = [newTip, ...(profile.tipsHistory || [])];
         setProfile({ ...profile, tipsHistory: updatedHistory });
      }
      setLoading(false);
    };
    initData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleCompleteQuest = (questId: string) => {
    if (!plan) return;

    const completedQuest = plan.quests.find(q => q.id === questId);
    if (!completedQuest || completedQuest.isCompleted) return;

    soundEngine.playSuccess();

    const updatedQuests = plan.quests.map(q => {
      if (q.id === questId) return { ...q, isCompleted: true };
      return q;
    });
    const updatedPlan = { ...plan, quests: updatedQuests };
    setPlan(updatedPlan);
    localStorage.setItem(`titan_plan_${updatedPlan.date}`, JSON.stringify(updatedPlan));

    let newGlobalXP = profile.currentXP + completedQuest.xpReward;
    let newGlobalLevel = profile.level;
    let newGlobalMaxXP = profile.maxXP;
    let globalLeveledUp = false;

    if (newGlobalXP >= newGlobalMaxXP) {
      newGlobalLevel += 1;
      newGlobalXP = newGlobalXP - newGlobalMaxXP;
      newGlobalMaxXP = Math.floor(newGlobalMaxXP * 1.5);
      globalLeveledUp = true;
    }

    const statKey = completedQuest.statBonus;
    const currentStat = profile.stats[statKey];
    
    // Safety check if stat exists (migration)
    if (!currentStat) return;

    let newStatXP = currentStat.xp + completedQuest.xpReward; 
    let newStatLevel = currentStat.level;
    let newStatMaxXP = currentStat.maxXP;
    let statLeveledUp = false;

    if (newStatXP >= newStatMaxXP) {
        newStatLevel += 1;
        newStatXP = newStatXP - newStatMaxXP;
        newStatMaxXP = Math.floor(newStatMaxXP * 1.5);
        statLeveledUp = true;
    }

    if (globalLeveledUp) {
      soundEngine.playLevelUp();
      setTimeout(() => alert(`CHÚC MỪNG! BẠN ĐÃ THĂNG CẤP ${newGlobalLevel}!`), 100);
    } else if (statLeveledUp) {
        soundEngine.playLevelUp();
    }

    const newStats = {
        ...profile.stats,
        [statKey]: {
            level: newStatLevel,
            xp: newStatXP,
            maxXP: newStatMaxXP
        }
    };

    setProfile({
      ...profile,
      currentXP: newGlobalXP,
      maxXP: newGlobalMaxXP,
      level: newGlobalLevel,
      stats: newStats
    });
  };

  const triggerWeeklyReview = async () => {
    soundEngine.playClick();
    setLoading(true);
    const review = await generateWeeklyReview(profile);
    const updatedReviews = [...(profile.weeklyReviews || []), review];
    setProfile({ ...profile, weeklyReviews: updatedReviews });
    setCurrentReview(review);
    setShowWeeklyReport(true);
    setLoading(false);
    soundEngine.playLevelUp();
  };
  
  const handleTriggerChallenge = async () => {
    soundEngine.playClick();
    setLoadingChallenge(true);
    try {
      const challenge = await generateBossChallenge(profile);
      setActiveChallenge(challenge);
    } catch (e) {
      alert("Không tìm thấy Boss nào gần đây.");
    } finally {
      setLoadingChallenge(false);
    }
  };

  const handleCompleteChallenge = (result: ChallengeResult, xpGained: number) => {
    const updatedHistory = [...(profile.challengeHistory || []), result];
    
    const newXP = profile.currentXP + xpGained;
    let newLevel = profile.level;
    let newMaxXP = profile.maxXP;
    
    if (newXP >= profile.maxXP) {
      newLevel += 1;
      newMaxXP = Math.floor(profile.maxXP * 1.5);
      alert(`BOSS DEFEATED! LEVEL UP: ${newLevel}`);
    }

    setProfile({
      ...profile,
      currentXP: newLevel > profile.level ? newXP - profile.maxXP : newXP,
      maxXP: newMaxXP,
      level: newLevel,
      challengeHistory: updatedHistory
    });
    
    setActiveChallenge(null);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setProfile({ ...profile, settings: newSettings });
  };

  const handleUpdateStyle = (newStyle: TrainingStyle) => {
    setProfile({ ...profile, trainingStyle: newStyle });
    soundEngine.playClick();
  };

  const handleUpdateFaction = (newFaction: Faction) => {
    setProfile({ ...profile, faction: newFaction });
    soundEngine.playLevelUp();
    alert(`Bạn đã gia nhập ${newFaction}! Các nhiệm vụ ngày mai sẽ thay đổi.`);
  };

  return (
    <div className="min-h-screen bg-rpg-dark p-4 md:p-8 pb-24">
      {showWeeklyReport && currentReview && (
        <WeeklyReport review={currentReview} onClose={() => setShowWeeklyReport(false)} />
      )}
      {showSettings && (
        <SettingsModal 
          settings={profile.settings} 
          onUpdateSettings={handleUpdateSettings} 
          onClose={() => setShowSettings(false)}
          currentStyle={profile.trainingStyle}
          onUpdateStyle={handleUpdateStyle}
          currentFaction={profile.faction}
          onUpdateFaction={handleUpdateFaction}
          onReset={onReset}
        />
      )}
      {activeChallenge && (
        <ChallengeModal 
          challenge={activeChallenge} 
          onClose={() => setActiveChallenge(null)}
          onComplete={handleCompleteChallenge}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-rpg text-rpg-gold uppercase tracking-widest drop-shadow-md">
            Titan RPG
          </h1>
          <div className="flex items-center gap-3">
             <button 
               onClick={triggerWeeklyReview}
               className="text-xs bg-slate-800 hover:bg-slate-700 text-rpg-gold border border-rpg-gold/50 px-3 py-1.5 rounded flex items-center gap-1 transition-all"
             >
               <Crown size={14} /> Tổng Kết Tuần
             </button>
             <button
               onClick={() => { soundEngine.playClick(); setShowSettings(true); }}
               className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded transition-colors"
               title="Cài đặt"
             >
               <Settings size={20} />
             </button>
          </div>
        </header>

        <HeroCard profile={profile} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          <div className="md:col-span-8 flex flex-col gap-6">
             {/* WEEKLY BOSS BANNER */}
             <div className="bg-gradient-to-r from-red-950 to-slate-900 border border-red-800/80 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group shadow-lg">
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-red-900/40 flex items-center justify-center border-2 border-red-500 animate-pulse">
                       <Skull size={32} className="text-red-500" />
                    </div>
                    <div>
                       <h3 className="text-white font-rpg text-2xl font-bold uppercase tracking-wide text-shadow-red">Weekly Boss Raid</h3>
                       <p className="text-red-300 text-xs">Kiểm tra tiến độ tuần này. Chiến thắng để nhận quà lớn!</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleTriggerChallenge}
                   disabled={loadingChallenge}
                   className="relative z-10 bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded shadow-lg flex items-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-50 border border-red-500"
                 >
                    {loadingChallenge ? 'Đang triệu hồi...' : <><Swords size={20} /> KHIÊU CHIẾN</>}
                 </button>
             </div>

             <div className="min-h-[500px]">
              <QuestBoard 
                quests={plan?.quests || []} 
                onCompleteQuest={handleCompleteQuest}
                loading={loading}
              />
             </div>
             <div className="bg-rpg-panel border border-slate-600 rounded-xl p-5">
                 <h3 className="font-rpg text-lg text-slate-200 mb-2 flex items-center gap-2">
                    <BookHeart size={20} className="text-pink-500" /> Lời Khuyên Sức Khỏe
                 </h3>
                 <HealthTipsLog tips={profile.tipsHistory || []} />
             </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="bg-rpg-panel border border-slate-600 rounded-xl p-5">
              <h3 className="font-rpg text-lg text-slate-200 mb-4 flex items-center gap-2">
                <Target size={20} className="text-red-500" /> Mục Tiêu Ngày
              </h3>
              
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span>Calories</span>
                      <span>{plan?.caloriesTarget} kcal</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-3/4"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span>Protein</span>
                      <span>{plan?.proteinTarget} g</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-1/2"></div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded border border-slate-700 text-sm">
                    <span className="text-slate-400">Trọng tâm: </span>
                    <span className="text-white font-semibold">{plan?.workoutFocus}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-rpg-panel border border-slate-600 rounded-xl p-5 h-64 flex flex-col">
               <h3 className="font-rpg text-lg text-slate-200 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" /> Lịch sử cân nặng
              </h3>
              <div className="flex-1 w-full text-xs">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profile.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} itemStyle={{ color: '#e2e8f0' }} />
                      <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: '#10b981'}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>

             <div className="bg-rpg-panel border border-slate-600 rounded-xl p-5">
                 <h3 className="font-rpg text-lg text-slate-200 mb-2 flex items-center gap-2">
                    <Swords size={20} className="text-purple-500" /> Chiến Tích Đấu Trường
                 </h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(!profile.challengeHistory || profile.challengeHistory.length === 0) ? (
                       <div className="text-xs text-slate-500 italic">Chưa có chiến tích nào.</div>
                    ) : (
                       [...profile.challengeHistory].reverse().slice(0, 5).map((h, i) => (
                          <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700 text-xs flex justify-between items-center">
                             <div>
                                <div className="text-slate-300 font-bold">{h.challengeTitle}</div>
                                <div className="text-slate-500">{h.record}</div>
                             </div>
                             <span className={`font-bold px-1.5 py-0.5 rounded ${h.result === 'VICTORY' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                                {h.result === 'VICTORY' ? 'WIN' : 'LOSE'}
                             </span>
                          </div>
                       ))
                    )}
                 </div>
             </div>
          </div>
        </div>
      </div>
      <OracleChat profile={profile} />
    </div>
  );
};

export default Dashboard;
