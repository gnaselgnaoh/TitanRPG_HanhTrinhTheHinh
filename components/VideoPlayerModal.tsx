
import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface VideoPlayerModalProps {
  query: string;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ query, onClose }) => {
  // Using YouTube embed with listType=search is a way to show search results without API key
  // However, it's sometimes restrictive.
  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query + " hướng dẫn tập gym")}`;
  const directSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " hướng dẫn tập gym")}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rpg-gold rounded-xl w-full max-w-4xl relative shadow-[0_0_30px_rgba(251,191,36,0.2)] flex flex-col">
        
        <div className="bg-slate-800/80 p-3 flex justify-between items-center border-b border-slate-700 rounded-t-xl backdrop-blur-sm">
          <h3 className="text-white font-rpg text-lg tracking-wide pl-2">Hướng Dẫn: <span className="text-rpg-gold">{query}</span></h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src={embedUrl}
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full"
          ></iframe>
          
          {/* Fallback overlay in case embed is blocked or empty */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
             <div className="text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded">Powered by YouTube</div>
          </div>
        </div>

        <div className="p-4 bg-slate-800 rounded-b-xl flex justify-center border-t border-slate-700">
          <a 
            href={directSearchUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            <ExternalLink size={16} /> Nếu video không phát, bấm vào đây để mở trên YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
