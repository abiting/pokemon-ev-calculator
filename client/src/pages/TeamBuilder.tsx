import { useRef, useState } from 'react';
import TeamSlot from '@/components/TeamSlot';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function TeamBuilder() {
  const teamRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!teamRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(teamRef.current, {
        backgroundColor: '#1e1b4b', // purple-900 to match background
        pixelRatio: 2, // Higher quality
        style: {
          // Ensure the background is fully opaque
          background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)'
        },
        fontEmbedCSS: '', // Skip font embedding to avoid CORS issues with Google Fonts
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'pokemon-team.png';
      link.click();
    } catch (error) {
      console.error('Failed to download team image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg border border-purple-500/30"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Team
          </Button>
        </div>
        
        <div ref={teamRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 -m-4 rounded-xl">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TeamSlot key={index} slotIndex={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
