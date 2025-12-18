'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { DISTRICTS as DB_DISTRICTS } from '@/lib/database/subscriptions';

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
        <div className="relative inline-block mr-3" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group inline-flex items-center gap-2 font-bold bg-transparent cursor-pointer transition-all duration-300 py-1"
                aria-label="Select District"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="electric-text text-shadow-glow">{selectedLabel}</span>
                <ChevronDown
                    className={`h-6 w-6 text-primary-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-primary-300`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 z-50 mt-3 w-56 overflow-hidden rounded-xl glass shadow-2xl animate-fade-in-down"
                    style={{ animationDuration: '200ms' }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-neutral-800/50">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-wider font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            Select District
                        </div>
                    </div>

                    {/* Options List */}
                    <ul role="listbox" className="max-h-64 overflow-auto py-2">
                        {DISTRICTS.map((district, index) => (
                            <li
                                key={district.value}
                                className={`
                                    relative flex items-center justify-between px-4 py-2.5 cursor-pointer select-none
                                    transition-all duration-150
                                    ${district.value === value
                                        ? 'bg-primary-500/10 text-primary-400'
                                        : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-foreground'
                                    }
                                `}
                                role="option"
                                aria-selected={district.value === value}
                                onClick={() => {
                                    onChange(district.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    animationDelay: `${index * 25}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                <span className="font-medium">{district.label}</span>
                                {district.value === value && (
                                    <Check className="h-4 w-4 text-primary-500" aria-hidden="true" />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
