
import React, { useState } from 'react';
import { Quest, QuestType, StatType } from '../types';
import { X, PlayCircle, Dumbbell, ClipboardList, AlertTriangle, Sword, Heart, Brain, Crown, Footprints, Utensils } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';
import { soundEngine } from '../utils/soundEngine';

interface QuestDetailModalProps {
  quest: Quest;
  onClose: () => void;
  onComplete: () => void;
}

const QuestDetailModal: React.FC<QuestDetailModalProps> = ({ quest, onClose, onComplete }) => {
  const [videoQuery, setVideoQuery] = useState<string | null>(null);

  const handlePlayVideo = (exerciseName: string) => {
    soundEngine.playClick();
    setVideoQuery(exerciseName);
  };

  const getStatIcon = (stat: StatType) => {
    switch (stat) {
      case StatType.STR: return <Sword size={16} />;
      case StatType.AGI: return <Footprints size={16} />;
      case StatType.VIT: return <Heart size={16} />;
      case StatType.INT: return <Brain size={16} />;
      case StatType.CHA: return <Crown size={16} />;
      default: return null;
    }
  };

  const getStatLabel = (stat: StatType) => {
    switch (stat) {
      case StatType.STR: return "Strength";
      case StatType.AGI: return "Agility";
      case StatType.VIT: return "Vitality";
      case StatType.INT: return "Intelligence";
      case StatType.CHA: return "Charisma";
      default: return "Stat";
    }
  };

  return (
    <>
      {videoQuery && (
        <VideoPlayerModal 
          query={videoQuery} 
          onClose={() => setVideoQuery(null)} 
        />
      )}

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[50] p-4 animate-fadeIn">
        <div className="bg-rpg-panel border-2 border-rpg-gold/50 rounded-2xl max-w-lg w-full relative shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col max-h-[85vh]">
          
          {/* Header */}
          <div className="bg-slate-800/80 p-5 flex justify-between items-start border-b border-slate-700 rounded-t-2xl">
            <div>
               <div className="flex gap-2 mb-2">
                  <span className="text-xs bg-slate-900 text-rpg-xp px-2 py-0.5 rounded border border-slate-700 font-mono">
                    +{quest.xpReward} XP
                  </span>
                  <span className={`text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold ${quest.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {quest.isCompleted ? 'HOÀN THÀNH' : 'ĐANG TIẾN HÀNH'}
                  </span>
                  <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                     {getStatIcon(quest.statBonus)} +1 {getStatLabel(quest.statBonus)}
                  </span>
               </div>
               <h3 className="text-2xl font-rpg text-white tracking-wide">{quest.title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto space-y-6 bg-rpg-panel flex-1">
             <p className="text-slate-300 italic text-sm border-l-2 border-rpg-gold pl-3">
               "{quest.description}"
             </p>

             {/* NUTRITION MENU SECTION */}
             {quest.type === QuestType.NUTRITION && quest.nutritionMenu && quest.nutritionMenu.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-900/50">
                    <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                       <Utensils size={14} /> Thực đơn được gợi ý
                    </h4>
                    <ul className="space-y-2">
                       {quest.nutritionMenu.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex gap-2">
                             <span className="text-emerald-500">•</span> {item}
                          </li>
                       ))}
                    </ul>
                </div>
             )}

             {/* Exercise List if available */}
             {quest.relatedExercises && quest.relatedExercises.length > 0 && (
               <div className="space-y-4">
                 <h4 className="text-rpg-gold font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                   <Dumbbell size={14} /> Yêu cầu tập luyện
                 </h4>
                 
                 {quest.relatedExercises.map((ex, idx) => (
                   <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="text-white font-bold text-base">{ex.name}</div>
                            <div className="text-xs text-rpg-accent font-mono mt-0.5">
                               {ex.sets} SETS x {ex.reps} REPS
                            </div>
                         </div>
                         <button 
                           onClick={() => handlePlayVideo(ex.name)}
                           className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs bg-red-900/20 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900/40 transition-colors"
                         >
                            <PlayCircle size={14} /> Video
                         </button>
                      </div>
                      
                      {ex.instructions && ex.instructions.length > 0 && (
                        <div className="text-xs text-slate-400 space-y-1 mt-2 bg-slate-900/50 p-2 rounded">
                           {ex.instructions.map((step, i) => (
                             <div key={i} className="flex gap-2">
                               <span className="text-slate-600">•</span> {step}
                             </div>
                           ))}
                        </div>
                      )}
                      
                      {ex.note && (
                         <div className="text-xs text-yellow-500/80 mt-2 italic flex gap-1 items-center">
                            <AlertTriangle size={10} /> {ex.note}
                         </div>
                      )}
                   </div>
                 ))}
               </div>
             )}

             {/* If no details but Workout */}
             {quest.type === QuestType.WORKOUT && (!quest.relatedExercises || quest.relatedExercises.length === 0) && (
                <div className="text-center py-4 bg-slate-800/30 rounded border border-slate-700 border-dashed">
                   <ClipboardList className="mx-auto text-slate-600 mb-2" />
                   <p className="text-slate-500 text-sm">Không có chi tiết bài tập cụ thể. Hãy thực hiện theo mô tả.</p>
                </div>
             )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-800 border-t border-slate-700 rounded-b-2xl flex justify-end gap-3">
             {!quest.isCompleted ? (
               <button 
                 onClick={() => { onComplete(); onClose(); }}
                 className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
               >
                  HOÀN THÀNH NHIỆM VỤ
               </button>
             ) : (
                <div className="w-full text-center text-emerald-500 font-bold py-2 bg-emerald-900/20 rounded border border-emerald-900/50">
                   ĐÃ HOÀN THÀNH
                </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestDetailModal;
