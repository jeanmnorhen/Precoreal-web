'use client';

import { useState } from 'react';

const CATEGORIAS = [
  'Todas',
  'Laticínios',
  'Grãos',
  'Bebidas',
  'Limpeza',
  'Higiene',
  'Massas',
  'Cafés',
  'Biscoitos',
  'Carnes',
  'Frutas',
  'Congelados',
];

interface CategoryFiltersProps {
  onSelect?: (categoria: string) => void;
}

export function CategoryFilters({ onSelect }: CategoryFiltersProps) {
  const [selected, setSelected] = useState('Todas');

  const handleClick = (cat: string) => {
    setSelected(cat);
    onSelect?.(cat);
  };

  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
      <div className="flex gap-2 pb-1">
        {CATEGORIAS.map((cat) => {
          const isActive = cat === selected;
          return (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                background: isActive ? 'var(--color-primary)' : 'var(--color-input)',
                color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground-muted)',
                border: isActive ? 'none' : '1.5px solid var(--color-border)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
