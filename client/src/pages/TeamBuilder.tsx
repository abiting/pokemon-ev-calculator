import TeamSlot from '@/components/TeamSlot';

export default function TeamBuilder() {
  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Team Builder</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TeamSlot key={index} slotIndex={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
