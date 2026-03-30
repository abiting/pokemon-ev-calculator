import TeamSlot from '@/components/TeamSlot';
export default function TeamBuilder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
          <a 
            href="https://abitingpokedex.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white px-4 py-2 rounded-md transition-colors border border-purple-500/30"
          >
            SP Calculator
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 -m-4 rounded-xl">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TeamSlot key={index} slotIndex={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
