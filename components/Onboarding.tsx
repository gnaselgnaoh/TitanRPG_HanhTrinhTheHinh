
import React, { useState, useEffect } from 'react';
import { UserProfile, StatType, TrainingStyle, Faction, UserClass } from '../types';
import { ShieldCheck, User, Activity, Dumbbell, Wind, Swords, Skull, Heart, Scale, Flame } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    height: 170,
    weight: 65,
    targetWeight: 65,
    faction: Faction.BALANCE_ORDER,
    trainingStyle: TrainingStyle.GYM
  });

  const [determinedClass, setDeterminedClass] = useState<UserClass>(UserClass.ROOKIE_WARRIOR);

  // Auto-determine Class based on Age
  useEffect(() => {
    const age = formData.age;
    let cls = UserClass.ROOKIE_WARRIOR;
    
    if (age >= 13 && age <= 17) cls = UserClass.YOUNG_ADVENTURER;
    else if (age >= 18 && age <= 24) cls = UserClass.ROOKIE_WARRIOR;
    else if (age >= 25 && age <= 35) cls = UserClass.ELITE_KNIGHT;
    else if (age >= 36 && age <= 50) cls = UserClass.GUARDIAN;
    else if (age > 50) cls = UserClass.ELDER_SAGE;

    setDeterminedClass(cls);
  }, [formData.age]);

  const getClassDescription = (cls: UserClass) => {
    switch (cls) {
      case UserClass.YOUNG_ADVENTURER: return "Độ tuổi 13-17. Hệ số hồi phục cao. Nhiệm vụ tập trung phát triển chiều cao và nền tảng thể lực. Tránh gánh tạ quá nặng.";
      case UserClass.ROOKIE_WARRIOR: return "Độ tuổi 18-24. Hệ số Testosterone đỉnh cao. Giai đoạn vàng để bứt phá giới hạn cơ bắp và sức mạnh.";
      case UserClass.ELITE_KNIGHT: return "Độ tuổi 25-35. Chiến binh trưởng thành. Cân bằng giữa sức mạnh và sự dẻo dai. Tập trung kiểm soát mỡ thừa.";
      case UserClass.GUARDIAN: return "Độ tuổi 36-50. Người bảo hộ bền bỉ. Tập trung vào sức bền, bảo vệ tim mạch và duy trì phong độ.";
      case UserClass.ELDER_SAGE: return "Độ tuổi 50+. Bậc thầy thông thái. Chú trọng sự an toàn, linh hoạt xương khớp và sức khỏe trường thọ.";
    }
  };

  const getFactionIcon = (faction: Faction) => {
     switch(faction) {
       case Faction.IRON_CLAN: return <Dumbbell className="text-red-500" size={32} />;
       case Faction.SHADOW_RUNNER: return <Wind className="text-purple-500" size={32} />;
       case Faction.TITAN_TRIBE: return <Skull className="text-orange-500" size={32} />;
       case Faction.BALANCE_ORDER: return <Scale className="text-emerald-500" size={32} />;
     }
  };

  const getFactionInfo = (faction: Faction) => {
     switch(faction) {
       case Faction.IRON_CLAN: return { title: "Iron Clan", sub: "Tăng Cơ & Sức Mạnh", desc: "Gia tộc của sắt thép. Tập trung vào Hypertrophy và nâng tạ nặng." };
       case Faction.SHADOW_RUNNER: return { title: "Shadow Runner", sub: "Giảm Mỡ & Cardio", desc: "Hội sát thủ bóng đêm. Tập trung vào Cardio, HIIT và sự nhanh nhẹn." };
       case Faction.TITAN_TRIBE: return { title: "Titan Tribe", sub: "Tăng Cân (Bulking)", desc: "Bộ lạc khổng lồ. Ăn nhiều, tập nặng để gia tăng kích thước tối đa." };
       case Faction.BALANCE_ORDER: return { title: "Balance Order", sub: "Sức Khỏe & Dẻo Dai", desc: "Hội tu sĩ cân bằng. Duy trì vóc dáng, sức khỏe và sự linh hoạt." };
     }
  };

  const handleSubmit = () => {
    soundEngine.playSuccess();
    const initialStat = { level: 1, xp: 0, maxXP: 100 };

    const newProfile: UserProfile = {
      ...formData,
      userClass: determinedClass, // Assign the calculated class
      level: 1,
      currentXP: 0,
      maxXP: 1000,
      streak: 0,
      stats: {
        [StatType.STR]: { ...initialStat },
        [StatType.AGI]: { ...initialStat },
        [StatType.VIT]: { ...initialStat },
        [StatType.INT]: { ...initialStat },
        [StatType.CHA]: { ...initialStat }
      },
      history: [
        { date: new Date().toISOString().split('T')[0], weight: formData.weight, calories: 0 }
      ],
      tipsHistory: [],
      weeklyReviews: [],
      challengeHistory: [], 
      settings: { soundEnabled: true, volume: 0.5, notificationEnabled: false }
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-rpg-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-rpg-panel border border-slate-600 rounded-2xl shadow-2xl p-8 relative overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-slate-800 w-full">
           <div className="h-full bg-rpg-gold transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-rpg text-white mb-1">Khởi Tạo Nhân Vật</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest">Bước {step}/3</p>
        </div>

        {/* STEP 1: Basic Info & Class Reveal */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn flex-1">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-1">Tên Anh Hùng</label>
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" placeholder="Nhập tên..." />
                </div>
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-1">Tuổi (Quyết định Class)</label>
                   <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                </div>
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-1">Chiều cao (cm)</label>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                </div>
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-1">Cân nặng (kg)</label>
                   <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                </div>
             </div>
             
             {/* Class Reveal Card */}
             <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/50 rounded-xl p-4 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-xs text-indigo-300 uppercase font-bold mb-1">Class Nhân Vật Của Bạn</div>
                <h3 className="text-2xl font-rpg text-white mb-2 text-shadow-blue">{determinedClass}</h3>
                <p className="text-slate-300 text-sm italic">"{getClassDescription(determinedClass)}"<br/><span className="text-xs text-slate-500">(Tự động xác định dựa trên tuổi {formData.age})</span></p>
             </div>

             <button onClick={() => { soundEngine.playClick(); setStep(2); }} disabled={!formData.name} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded transition-all disabled:opacity-50">TIẾP TỤC</button>
          </div>
        )}

        {/* STEP 2: Choose Faction */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn flex-1">
             <div className="text-center text-slate-300 text-sm mb-4">Chọn Môn Phái (Mục Tiêu) của bạn để nhận nhiệm vụ phù hợp.</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {Object.values(Faction).map((f) => {
                  const info = getFactionInfo(f);
                  return (
                    <div 
                      key={f}
                      onClick={() => { soundEngine.playClick(); setFormData({...formData, faction: f}); }}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden group flex flex-col items-center text-center ${formData.faction === f ? 'bg-slate-800 border-rpg-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-slate-900 border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'}`}
                    >
                       <div className="mb-2">{getFactionIcon(f)}</div>
                       <h3 className={`font-rpg text-lg font-bold ${formData.faction === f ? 'text-rpg-gold' : 'text-slate-200'}`}>{info.title}</h3>
                       <div className="text-xs font-bold text-slate-400 mb-2 uppercase">{info.sub}</div>
                       <p className="text-xs text-slate-500">{info.desc}</p>
                    </div>
                  );
                })}
             </div>
             <div className="flex gap-3">
                <button onClick={() => { soundEngine.playClick(); setStep(1); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded">QUAY LẠI</button>
                <button onClick={() => { soundEngine.playClick(); setStep(3); }} className="flex-1 bg-rpg-gold hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded">XÁC NHẬN</button>
             </div>
          </div>
        )}

        {/* STEP 3: Training Style & Finalize */}
        {step === 3 && (
           <div className="space-y-6 animate-fadeIn flex-1">
               <div className="text-center text-slate-300 text-sm mb-2">Bước cuối: Chọn trường phái luyện tập.</div>
               <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => {soundEngine.playClick(); setFormData({...formData, trainingStyle: TrainingStyle.CALISTHENICS})}}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all text-center ${formData.trainingStyle === TrainingStyle.CALISTHENICS ? 'bg-cyan-900/30 border-cyan-400' : 'bg-slate-800 border-slate-600 opacity-50'}`}
                  >
                     <Wind className="mx-auto text-cyan-400 mb-2" size={32} />
                     <div className="text-cyan-400 font-bold font-rpg text-lg">Calisthenics</div>
                     <div className="text-xs text-slate-400 mt-1">Bodyweight, kỹ năng</div>
                  </div>
                  <div 
                    onClick={() => {soundEngine.playClick(); setFormData({...formData, trainingStyle: TrainingStyle.GYM})}}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all text-center ${formData.trainingStyle === TrainingStyle.GYM ? 'bg-red-900/30 border-red-400' : 'bg-slate-800 border-slate-600 opacity-50'}`}
                  >
                     <Dumbbell className="mx-auto text-red-400 mb-2" size={32} />
                     <div className="text-red-400 font-bold font-rpg text-lg">Gym</div>
                     <div className="text-xs text-slate-400 mt-1">Tạ, máy móc</div>
                  </div>
               </div>

               <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-xs text-slate-400">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Activity size={14}/> Tóm Tắt Hồ Sơ:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                     <li>Anh hùng: <span className="text-white">{formData.name}</span> ({formData.age} tuổi)</li>
                     <li>Class: <span className="text-indigo-400 font-bold">{determinedClass}</span></li>
                     <li>Môn phái: <span className="text-rpg-gold font-bold">{formData.faction}</span></li>
                     <li>Phong cách: <span className="text-white">{formData.trainingStyle}</span></li>
                  </ul>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => { soundEngine.playClick(); setStep(2); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded">QUAY LẠI</button>
                  <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-rpg-gold to-orange-500 text-slate-900 font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2">
                     <ShieldCheck size={20} /> KHỞI HÀNH
                  </button>
               </div>
           </div>
        )}

        {/* CREDIT FOOTER */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col items-center justify-center animate-fadeIn">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-semibold">
            Được phát triển bởi
          </span>
          <div className="flex items-center gap-4 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-700 shadow-lg hover:border-rpg-gold/50 transition-all group cursor-default">
             {/* Avatar Image with Fallback */}
             <div className="w-16 h-16 relative shrink-0 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-rpg-gold transition-colors">
                <img 
                  src="./avatar.png"
                  alt="HMS Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                     // Fallback to CSS Logo if image not found
                     e.currentTarget.style.display = 'none';
                     const parent = e.currentTarget.parentElement;
                     if(parent) {
                       parent.className = "w-16 h-16 rounded-full border-2 border-blue-900/80 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0";
                       parent.innerHTML = `
                         <div class="absolute inset-0 bg-blue-500/10 rounded-full"></div>
                         <div class="font-rpg text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm transform translate-y-0.5 z-10">S</div>
                         <div class="absolute top-0 w-full h-1/2 bg-white/5 pointer-events-none"></div>
                       `;
                     }
                  }}
                />
             </div>
             
             <div className="flex flex-col justify-center">
                <h3 className="font-rpg text-lg font-bold text-rpg-gold leading-none tracking-wide text-shadow-sm group-hover:text-yellow-300 transition-colors">
                  HOÀNG LÊ MINH SANG
                </h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/50 font-mono tracking-wider">
                     PK04346
                   </span>
                   <div className="h-px w-8 bg-slate-700"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
