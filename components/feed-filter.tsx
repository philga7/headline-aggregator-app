import { useState } from 'react';

interface FeedFilterProps {
  onFilterChange: (sources: string[]) => void;
  availableSources: string[];
}

export function FeedFilter({ onFilterChange, availableSources }: FeedFilterProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(availableSources);

  const handleSourceToggle = (source: string) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source];
    
    setSelectedSources(newSources);
    onFilterChange(newSources);
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Filter Sources</h2>
      <div className="flex gap-2">
        {availableSources.map(source => (
          <button
            key={source}
            onClick={() => handleSourceToggle(source)}
            className={`px-3 py-1 rounded ${
              selectedSources.includes(source)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {source}
          </button>
        ))}
      </div>
    </div>
  );
}
