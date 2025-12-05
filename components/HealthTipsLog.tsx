
import React from 'react';
import { HealthTip } from '../types';
import { Lightbulb, Quote } from 'lucide-react';

interface HealthTipsLogProps {
  tips: HealthTip[];
}

const HealthTipsLog: React.FC<HealthTipsLogProps> = ({ tips }) => {
  const sortedTips = [...tips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const todayTip = sortedTips[0];

  if (!todayTip) return null;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Today's Tip Only */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote size={60} />
        </div>
        <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-yellow-400" size={20} />
            <h3 className="text-indigo-200 font-rpg text-lg">Lời Sấm Truyền Hôm Nay</h3>
        </div>
        <p className="text-white text-lg font-medium italic relative z-10 leading-relaxed">
          "{todayTip.content}"
        </p>
        <div className="mt-3 flex gap-2">
          <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-800">
            {todayTip.category}
          </span>
          <span className="text-xs text-indigo-400 py-1">
            {todayTip.date}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthTipsLog;
