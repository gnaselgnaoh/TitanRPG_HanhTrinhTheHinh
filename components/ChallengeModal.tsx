
import React, { useState } from 'react';
import { Challenge, ChallengeResult } from '../types';
import { Skull, Swords, Timer, X, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ChallengeModalProps {
  challenge: Challenge;
  onClose: () => void;
  onComplete: (result: ChallengeResult, xp: number) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ challenge, onClose, onComplete }) => {
  const [step, setStep] = useState<'INTRO' | 'ACTIVE' | 'RESULT'>('INTRO');
  const [userRecord, setUserRecord] = useState('');
  
  const handleStart = () => {
    soundEngine.playClick();
    setStep('ACTIVE');
  };

  const handleSubmit = (victory: boolean) => {
    if (!userRecord) return;
    
    if (victory) soundEngine.playLevelUp();
    else soundEngine.playError();

    const result: ChallengeResult = {
      date: new Date().toISOString().split('T')[0],
      challengeTitle: challenge.title,
      result: victory ? 'VICTORY' : 'DEFEAT',
      record: userRecord,
      xpGained: victory ? challenge.xpReward : Math.floor(challenge.xpReward / 5)
    };

    onComplete(result, result.xpGained);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'INSANE': return 'text-purple-500 border-purple-500';
      case 'HARD': return 'text-red-500 border-red-500';
      default: return 'text-yellow-500 border-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[80] p-4 animate-fadeIn backdrop-blur-md">
      {/* Added max-h-[90vh] and overflow-y-auto to fix layout on small screens */}
      <div className="bg-slate-900 border-4 border-red-900/50 rounded-2xl max-w-lg w-full relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Boss Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900/50 to-slate-900 pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white z-10 bg-slate-900/50 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        {step === 'INTRO' && (
          <div className="p-8 text-center relative z-10 space-y-6">
            <div className="mx-auto w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center border-2 border-red-500 animate-pulse-slow">
              <Skull size={48} className="text-red-500" />
            </div>
            
            <div>
              <div className={`inline-block px-3 py-1 rounded border text-xs font-bold mb-2 ${getDifficultyColor(challenge.difficulty)}`}>
                 {challenge.difficulty} RAID
              </div>
              <h2 className="text-3xl font-rpg text-white uppercase tracking-widest text-shadow-red leading-tight">{challenge.title}</h2>
              <p className="text-red-300/80 italic text-sm mt-2">"{challenge.lore}"</p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-lg border border-red-900/50 space-y-4">
               <div className="flex items-center gap-3 justify-center text-white font-bold text-lg">
                  <Swords className="text-red-500" /> {challenge.description}
               </div>
               <div className="text-slate-400 text-sm">
                  Yêu cầu chiến thắng: <span className="text-rpg-gold font-bold">{challenge.requirements}</span>
               </div>
               <div className="flex justify-center gap-2 mt-2">
                 <span className="text-xs bg-slate-900 px-2 py-1 rounded text-rpg-xp border border-slate-700">
                    Reward: {challenge.xpReward} XP
                 </span>
               </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-rpg font-bold text-xl py-4 rounded shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              CHẤP NHẬN THỬ THÁCH
            </button>
          </div>
        )}

        {step === 'ACTIVE' && (
           <div className="p-8 text-center relative z-10 flex flex-col items-center justify-center min-h-[400px]">
              <AlertTriangle size={64} className="text-yellow-500 animate-bounce mb-6" />
              <h3 className="text-2xl text-white font-bold mb-4">ĐANG TRONG TRẬN CHIẾN!</h3>
              <p className="text-slate-400 mb-8 max-w-xs">
                Hãy thực hiện bài tập ngay bây giờ. Đừng quay lại đây cho đến khi bạn đã vắt kiệt sức lực cuối cùng!
              </p>
              
              <div className="w-full space-y-4">
                 <div className="bg-slate-800 p-4 rounded border border-slate-700">
                    <label className="block text-slate-300 text-sm mb-2">Thành tích của bạn (Reps/Thời gian)</label>
                    <input 
                      type="text" 
                      value={userRecord}
                      onChange={(e) => setUserRecord(e.target.value)}
                      placeholder="VD: 50 cái, 2 phút..."
                      className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-center font-bold text-lg focus:border-rpg-gold outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSubmit(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded border border-slate-600"
                    >
                      THẤT BẠI
                    </button>
                    <button 
                      onClick={() => handleSubmit(true)}
                      disabled={!userRecord}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    >
                      CHIẾN THẮNG
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
