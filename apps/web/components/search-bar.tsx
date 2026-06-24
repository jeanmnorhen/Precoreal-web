'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, placeholder = 'Buscar ofertas...', autoFocus }: SearchBarProps) {
  const [term, setTerm] = useState('');
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((value: string) => {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 300);
  }, [onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/busca?busca=${encodeURIComponent(term.trim())}`);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
              style={{ color: 'var(--color-foreground-muted)' }}>
          🔍
        </span>
        <input
          type="text"
          value={term}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-base outline-none transition-all focus:ring-2"
          style={{
            background: 'var(--color-input)',
            color: 'var(--color-foreground)',
            border: '1.5px solid var(--color-border)',
          }}
        />
      </div>
    </form>
  );
}
