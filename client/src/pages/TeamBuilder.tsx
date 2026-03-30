import TeamSlot from '@/components/TeamSlot';
import { useRef, useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamBuilder() {
  const teamRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!teamRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Wait a bit to ensure any pending renders are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await domToPng(teamRef.current, {
        backgroundColor: '#0f172a', // slate-900 to match background
        scale: 2, // Higher quality
      });
      
      const link = document.createElement('a');
      link.download = 'pokemon-team.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download team image:', error);
      alert('下載圖片失敗，請稍後再試。');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title="下載隊伍圖片"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </Button>
            <a 
              href="https://abitingpokedex.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white px-4 py-2 rounded-md transition-colors border border-purple-500/30"
            >
              SP Calculator
            </a>
          </div>
        </div>
        
        <div ref={teamRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 -m-4 rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TeamSlot key={index} slotIndex={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
