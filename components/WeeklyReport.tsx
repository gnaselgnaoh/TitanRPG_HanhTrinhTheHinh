
import React from 'react';
import { WeeklyReview } from '../types';
import { X, Trophy, Star, TrendingUp } from 'lucide-react';

interface WeeklyReportProps {
  review: WeeklyReview;
  onClose: () => void;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ review, onClose }) => {
  const getRankColor = (rank: string) => {
    switch(rank) {
      case 'S': return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
      case 'A': return 'text-purple-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rpg-gold rounded-2xl max-w-lg w-full relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)]">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rpg-gold to-transparent"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <Trophy className="mx-auto text-rpg-gold mb-4" size={64} />
          
          <h2 className="text-3xl font-rpg text-white mb-1">Tổng Kết Tuần</h2>
          <p className="text-slate-400 text-sm mb-6">Từ {review.weekStartDate} đến {review.date}</p>

          <div className="mb-8 relative">
            <div className="text-sm text-slate-500 uppercase tracking-widest mb-2">Xếp Hạng</div>
            <div className={`text-8xl font-black font-rpg ${getRankColor(review.rank)}`}>
              {review.rank}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">XP Tích Lũy</div>
              <div className="text-xl font-bold text-rpg-xp">{review.totalXP}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded border border-slate-700">
               <div className="text-xs text-slate-400 mb-1">Thay đổi cân nặng</div>
               <div className={`text-xl font-bold flex items-center justify-center gap-1 ${review.weightChange <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 <TrendingUp size={16} /> {review.weightChange > 0 ? '+' : ''}{review.weightChange}kg
               </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-left">
            <div className="flex items-center gap-2 mb-2 text-rpg-gold text-sm font-bold uppercase">
              <Star size={14} /> Đánh giá từ Guild Master
            </div>
            <p className="text-slate-300 italic text-sm leading-relaxed">
              "{review.evaluation}"
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="mt-8 bg-rpg-gold text-slate-900 font-bold py-3 px-8 rounded hover:bg-yellow-400 transition-colors w-full"
          >
            TIẾP TỤC HÀNH TRÌNH
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
