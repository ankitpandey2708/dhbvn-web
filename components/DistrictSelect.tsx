'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DISTRICTS as DB_DISTRICTS } from '@/lib/database/subscriptions';

// District mapping from database source
const DISTRICTS = DB_DISTRICTS.map(d => ({
    value: d.id.toString(),
    label: d.name
}));

interface DistrictSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function DistrictSelect({
    value,
    onChange,
}: DistrictSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = DISTRICTS.find((d) => d.value === value)?.label || 'Faridabad';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block mr-2" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-1 font-bold bg-transparent border-b-2 border-neutral-300 focus:border-blue-500 focus:outline-none cursor-pointer hover:border-neutral-400 transition-colors py-1"
                aria-label="Select District"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{selectedLabel}</span>
                <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ul role="listbox">
                        {DISTRICTS.map((district) => (
                            <li
                                key={district.value}
                                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-neutral-100 ${district.value === value ? 'bg-neutral-50 text-blue-600 font-medium' : 'text-neutral-900'
                                    }`}
                                role="option"
                                aria-selected={district.value === value}
                                onClick={() => {
                                    onChange(district.value);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-center">
                                    <span className="block truncate">{district.label}</span>
                                </div>
                                {district.value === value ? (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
