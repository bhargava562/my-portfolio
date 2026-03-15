"use client";

import { useEffect, useState } from 'react';
import { getPortfolioData } from '@/lib/actions';
import { ID_TO_DATA_KEY } from '@/lib/sectionMetadata';
import type { WindowData } from '@/components/WindowManager';

/** Fields excluded from the card display (internal/path fields) */
const EXCLUDED_FIELDS = new Set(['id', 'created_at', 'updated_at']);
const PATH_SUFFIX = '_path';

function isExcluded(field: string): boolean {
  return EXCLUDED_FIELDS.has(field) || field.endsWith(PATH_SUFFIX);
}

function formatFieldName(field: string): string {
  return field
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function GenericSectionContent({ windowData }: { windowData: WindowData }) {
  const [entries, setEntries] = useState<Record<string, unknown>[] | null>(null);

  const sectionId = windowData.baseId;
  const dataKey = ID_TO_DATA_KEY[sectionId] || sectionId;

  useEffect(() => {
    getPortfolioData().then(data => {
      const sectionData = data[dataKey];
      if (Array.isArray(sectionData)) {
        setEntries(sectionData as Record<string, unknown>[]);
      } else {
        setEntries([]);
      }
    });
  }, [dataKey]);

  if (entries === null) {
    return <div className="p-8 text-white bg-[#1E1E1E]">Loading...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-white bg-[#1E1E1E]">
        <h1 className="text-2xl font-bold mb-4">{windowData.title}</h1>
        <p className="text-gray-400">No entries found.</p>
      </div>
    );
  }

  // Auto-detect display columns from the first entry
  const displayFields = Object.keys(entries[0]).filter(f => !isExcluded(f));

  return (
    <div className="flex-1 p-8 overflow-auto text-white bg-[#1E1E1E]">
      <h1 className="text-2xl font-bold mb-6">{windowData.title}</h1>
      <div className="grid grid-cols-1 gap-4">
        {entries.map((entry, idx) => (
          <div key={(entry.id as string | number) ?? idx} className="bg-[#2D2D2D] rounded-lg p-4 border border-[#3D3D3D]">
            {displayFields.map(field => {
              const value = entry[field];
              if (value === null || value === undefined || value === '') return null;
              return (
                <div key={field} className="flex gap-3 py-1">
                  <span className="text-gray-400 text-sm min-w-[120px] shrink-0">{formatFieldName(field)}</span>
                  <span className="text-sm text-gray-100 break-words">{String(value)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
