
import React, { useState } from 'react';
import { ExerciseDetail, ExerciseDifficulty } from '../types';
import { X, PlayCircle, Layers, ClipboardList, AlertTriangle, Repeat, ThumbsUp, ThumbsDown, Minus, Trophy, Dumbbell } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

interface ExerciseModalProps {
  exercise: ExerciseDetail;
  onClose: () => void;
  onSwapExercise: (alternativeName: string) => void;
  onRateExercise: (rating: ExerciseDifficulty) => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose, onSwapExercise, onRateExercise }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      {showVideo && (
        <VideoPlayerModal 
          query={exercise.name} 
          onClose={() => setShowVideo(false)} 
        />
      )}

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-rpg-dark border border-slate-600 rounded-2xl max-w-2xl w-full relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          
          {/* Hero Header */}
          <div className="relative bg-slate-900 p-6 pb-8 border-b border-slate-700">
             <div className="absolute top-0 right-0 p-6 opacity-5">
               <Dumbbell size={120} />
             </div>
             <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-full hover:bg-slate-700"
            >
              <X size={20} />
            </button>

             <div className="relative z-10">
                <span className="text-rpg-gold text-xs font-bold uppercase tracking-widest border border-rpg-gold/30 px-2 py-0.5 rounded bg-rpg-gold/10 mb-2 inline-block">
                  {exercise.muscleGroup || 'General'} Class
                </span>
                <h2 className="text-3xl font-rpg text-white tracking-wide mb-1 shadow-black drop-shadow-lg">{exercise.name}</h2>
                <div className="flex gap-4 mt-4">
                  <div className="flex flex-col bg-slate-800/80 px-4 py-2 rounded border border-slate-700 items-center min-w-[80px]">
                     <span className="text-xs text-slate-500 uppercase font-bold">Sets</span>
                     <span className="text-2xl font-bold text-rpg-accent">{exercise.sets}</span>
                  </div>
                  <div className="flex flex-col bg-slate-800/80 px-4 py-2 rounded border border-slate-700 items-center min-w-[80px]">
                     <span className="text-xs text-slate-500 uppercase font-bold">Reps</span>
                     <span className="text-2xl font-bold text-rpg-accent">{exercise.reps}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Content Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 bg-rpg-panel flex-1">
            
            {/* Action Bar */}
            <button 
               onClick={() => setShowVideo(true)}
               className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] group"
             >
               <PlayCircle className="group-hover:animate-pulse" size={20} /> 
               XEM VIDEO HƯỚNG DẪN
             </button>

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="text-indigo-300 font-bold flex items-center gap-2 border-b border-indigo-500/30 pb-2">
                <ClipboardList size={18} /> Bí Kíp Thực Hiện
              </h3>
              {exercise.instructions && exercise.instructions.length > 0 ? (
                <ol className="space-y-3">
                  {exercise.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-700 shadow-inner">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-slate-500 italic text-sm">Chưa có hướng dẫn chi tiết.</p>
              )}
            </div>

            {/* Notes */}
            {exercise.note && (
               <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-yellow-500 text-xs font-bold uppercase mb-1">Lưu ý quan trọng</h4>
                    <p className="text-yellow-200/80 text-sm italic">{exercise.note}</p>
                  </div>
               </div>
            )}

            {/* Alternatives (Swapping) */}
            {exercise.alternatives && exercise.alternatives.length > 0 && (
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <h3 className="text-slate-300 font-bold text-sm mb-3 flex items-center gap-2">
                     <Repeat size={16} className="text-emerald-400" /> Kỹ Năng Thay Thế
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                     {exercise.alternatives.map((alt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => onSwapExercise(alt)}
                          className="flex items-center justify-between w-full text-left text-sm bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 p-3 rounded-lg text-slate-300 transition-all group"
                        >
                           <span className="group-hover:text-white">{alt}</span>
                           <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500 group-hover:bg-emerald-900 group-hover:text-emerald-400">Chọn</span>
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* Rating */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <h3 className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                 <Trophy size={14} /> Đánh giá độ khó
               </h3>
               <div className="flex gap-2">
                  <button 
                    onClick={() => onRateExercise(ExerciseDifficulty.EASY)}
                    className={`flex-1 py-2 rounded text-sm font-bold flex flex-col items-center gap-1 transition-all ${exercise.userFeedback === ExerciseDifficulty.EASY ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <ThumbsUp size={16} /> Dễ
                  </button>
                  <button 
                     onClick={() => onRateExercise(ExerciseDifficulty.NORMAL)}
                     className={`flex-1 py-2 rounded text-sm font-bold flex flex-col items-center gap-1 transition-all ${exercise.userFeedback === ExerciseDifficulty.NORMAL ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Minus size={16} /> Vừa
                  </button>
                  <button 
                     onClick={() => onRateExercise(ExerciseDifficulty.HARD)}
                     className={`flex-1 py-2 rounded text-sm font-bold flex flex-col items-center gap-1 transition-all ${exercise.userFeedback === ExerciseDifficulty.HARD ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <ThumbsDown size={16} /> Khó
                  </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseModal;
