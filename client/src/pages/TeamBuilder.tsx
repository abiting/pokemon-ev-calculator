import { useRef, useState } from 'react';
import TeamSlot from '@/components/TeamSlot';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function TeamBuilder() {
  const teamRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!teamRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(teamRef.current, {
        backgroundColor: '#0f172a', // slate-900 to match background
        scale: 2, // Higher quality
        useCORS: true, // Allow loading external images (sprites)
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'pokemon-team.png';
      link.click();
    } catch (error) {
      console.error('Failed to download team image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
