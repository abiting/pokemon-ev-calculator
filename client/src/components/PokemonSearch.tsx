import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface PokemonSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function PokemonSearch({ onSearch, isLoading }: PokemonSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="輸入寶可夢名稱或編號（例如：皮卡丘 或 25）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          搜尋
        </Button>
      </div>

    </form>
  );
}
