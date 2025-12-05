
import React, { useState } from 'react';
import { Quest, QuestType, StatType } from '../types';
import { CheckCircle2, Circle, Dumbbell, Utensils, Moon, Info, PlayCircle, Sword, Heart, Brain, Crown, Footprints, Sparkles } from 'lucide-react';
import QuestDetailModal from './QuestDetailModal';
import { soundEngine } from '../utils/soundEngine';

interface QuestBoardProps {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  loading: boolean;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onCompleteQuest, loading }) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  if (loading) {
    return (
      <div className="bg-rpg-panel rounded-xl p-6 border border-slate-600 h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
         <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
         <div className="text-slate-400 font-rpg">Đang triệu hồi nhiệm vụ từ Guild Master...</div>
      </div>
    );
  }

  const handleOpenDetail = (e: React.MouseEvent, quest: Quest) => {
    e.stopPropagation();
    soundEngine.playClick();
    setSelectedQuest(quest);
  };

  return (
    <>
      {selectedQuest && (
        <QuestDetailModal 
          quest={selectedQuest} 
          onClose={() => setSelectedQuest(null)} 
          onComplete={() => onCompleteQuest(selectedQuest.id)}
        />
      )}

      <div className="bg-rpg-panel rounded-xl border border-slate-600 h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="font-rpg text-xl text-rpg-gold tracking-wide flex items-center gap-2 drop-shadow-md">
            📜 Bảng Nhiệm Vụ Hàng Ngày
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {quests.length === 0 && (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center">
              <Moon size={48} className="mb-4 opacity-50" />
              <p>Không có nhiệm vụ nào. Hãy nghỉ ngơi, Chiến Binh!</p>
            </div>
          )}
          
          {quests.map((quest) => (
             <QuestItem 
                key={quest.id} 
                quest={quest} 
                onComplete={onCompleteQuest}
                onDetail={handleOpenDetail}
             />
          ))}
        </div>
      </div>
    </>
  );
};

// Sub-component for individual quest animation logic
const QuestItem: React.FC<{
    quest: Quest;
    onComplete: (id: string) => void;
    onDetail: (e: React.MouseEvent, q: Quest) => void;
}> = ({ quest, onComplete, onDetail }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quest.isCompleted) return;
        
        setIsAnimating(true);
        // Delay actual completion logic to allow animation to play
        setTimeout(() => {
            onComplete(quest.id);
            // setIsAnimating(false); // No need to reset if it moves to completed list styling
        }, 600);
    };

    const getStatIcon = (stat: StatType) => {
        switch (stat) {
          case StatType.STR: return <Sword size={16} className="text-red-400" />;
          case StatType.AGI: return <Footprints size={16} className="text-cyan-400" />;
          case StatType.VIT: return <Heart size={16} className="text-emerald-400" />;
          case StatType.INT: return <Brain size={16} className="text-purple-400" />;
          case StatType.CHA: return <Crown size={16} className="text-yellow-400" />;
          default: return <Sparkles size={16} />;
        }
    };

    const getStatColor = (stat: StatType) => {
        switch (stat) {
          case StatType.STR: return "text-red-400 border-red-900/50 bg-red-900/10";
          case StatType.AGI: return "text-cyan-400 border-cyan-900/50 bg-cyan-900/10";
          case StatType.VIT: return "text-emerald-400 border-emerald-900/50 bg-emerald-900/10";
          case StatType.INT: return "text-purple-400 border-purple-900/50 bg-purple-900/10";
          case StatType.CHA: return "text-yellow-400 border-yellow-900/50 bg-yellow-900/10";
          default: return "text-slate-400";
        }
    };

    const getTypeIcon = (type: QuestType) => {
        switch (type) {
            case QuestType.WORKOUT: return <Dumbbell size={14} className="text-slate-400" />;
            case QuestType.NUTRITION: return <Utensils size={14} className="text-slate-400" />;
            default: return <Sparkles size={14} className="text-slate-400" />;
        }
    };

    return (
        <div 
            onClick={!quest.isCompleted ? handleComplete : undefined}
            className={`
                relative group p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer select-none overflow-hidden
                ${quest.isCompleted 
                  ? 'bg-slate-900/40 border-slate-800 opacity-60 grayscale-[0.5]' 
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-500 shadow-lg'
                }
                ${isAnimating ? 'animate-ping-once ring-4 ring-rpg-gold scale-[1.02] bg-rpg-gold/20' : ''}
            `}
        >
            {/* Glow Effect on Hover */}
            {!quest.isCompleted && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
                {/* Checkbox / Status Icon */}
                <div className="mt-1 transition-transform duration-300 transform group-active:scale-90">
                    {quest.isCompleted ? (
                        <div className="bg-emerald-500/20 p-1 rounded-full">
                           <CheckCircle2 className="text-emerald-500" size={24} />
                        </div>
                    ) : (
                        <Circle className="text-slate-600 group-hover:text-rpg-gold transition-colors" size={26} strokeWidth={1.5} />
                    )}
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-lg leading-snug transition-all ${quest.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                            {quest.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md text-xs border border-slate-700 h-7 shadow-inner">
                                <span className="text-rpg-xp font-bold tracking-wider">+{quest.xpReward} XP</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mt-1 mb-3 line-clamp-2 leading-relaxed">
                        {quest.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-slate-400">
                                {getTypeIcon(quest.type)} {quest.type}
                            </span>
                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded font-bold border ${getStatColor(quest.statBonus)}`}>
                                {getStatIcon(quest.statBonus)} +{quest.statBonus}
                            </span>
                        </div>

                        <button 
                            onClick={(e) => onDetail(e, quest)}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white pl-3 pr-4 py-1.5 rounded-full shadow-md border border-indigo-400/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group-button z-20"
                        >
                            {quest.type === QuestType.WORKOUT ? <PlayCircle size={14} /> : <Info size={14} />}
                            <span className="text-xs font-bold uppercase tracking-wider">Chi tiết</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Completion Flash Overlay */}
            {isAnimating && (
                <div className="absolute inset-0 bg-white/20 animate-pulse z-0 rounded-xl"></div>
            )}
        </div>
    );
};

export default QuestBoard;
