'use client';

import { useState, useRef, useEffect, type TouchEvent } from 'react';
import { Check, ChevronDown, MapPin, X } from 'lucide-react';
import { DISTRICT_OPTIONS } from '@/lib/district';

interface DistrictSelectProps {
    value: string;
    onChange: (value: string) => void;
}

function rowIndex(value: string) {
    const i = DISTRICT_OPTIONS.findIndex((d) => d.value === value);
    return String(i + 1).padStart(2, '0');
}

export function DistrictSelect({
    value,
    onChange,
}: DistrictSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = DISTRICT_OPTIONS.find((d) => d.value === value)?.label || 'Faridabad';

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
        <div className="relative inline-block" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group inline-flex items-end gap-2 font-display font-bold bg-transparent cursor-pointer transition-all duration-300"
                aria-label="Select District"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="electric-text text-shadow-glow">{selectedLabel}</span>
                <span className="inline-flex items-center justify-center w-7 h-7 mb-1.5 rounded-sm border border-primary-500/30 bg-primary-500/10 transition-all group-hover:bg-primary-500/20 group-hover:border-primary-500/50">
                    <ChevronDown
                        className={`h-4 w-4 text-primary-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </span>
            </button>

            {/* Dropdown — district index board */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 z-50 mt-3 w-60 overflow-hidden rounded-sm board-panel shadow-2xl animate-board-in"
                    style={{ transformOrigin: 'top' }}
                >
                    <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center gap-2 eyebrow text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        Select district
                    </div>

                    <ul role="listbox" className="max-h-72 overflow-auto py-1.5">
                        {DISTRICT_OPTIONS.map((district) => {
                            const selected = district.value === value;
                            return (
                                <li
                                    key={district.value}
                                    className={`
                                        group/row relative flex items-center gap-3 pl-4 pr-3 py-2.5 cursor-pointer select-none text-base font-sans
                                        transition-colors duration-150
                                        ${selected
                                            ? 'text-primary-400'
                                            : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-foreground'
                                        }
                                    `}
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => {
                                        onChange(district.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {selected && (
                                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500 shadow-[0_0_10px_-1px] shadow-primary-500" />
                                    )}
                                    <span className={`font-mono text-[11px] tabular ${selected ? 'text-primary-500' : 'text-neutral-600 group-hover/row:text-neutral-400'}`}>
                                        {rowIndex(district.value)}
                                    </span>
                                    <span className="font-medium flex-1">{district.label}</span>
                                    {selected && <Check className="h-4 w-4 text-primary-500 shrink-0" aria-hidden="true" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ─── Bottom Sheet Variant for Mobile ─── */

interface DistrictBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    value: string;
    onChange: (value: string) => void;
}

export function DistrictBottomSheet({
    isOpen,
    onClose,
    value,
    onChange,
}: DistrictBottomSheetProps) {
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const startYRef = useRef<number | null>(null);

    // Lock body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setDragY(0);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Swipe-to-dismiss: track downward drag on the handle/header, close past threshold
    const dragHandlers = {
        onTouchStart: (e: TouchEvent) => {
            startYRef.current = e.touches[0].clientY;
            setDragging(true);
        },
        onTouchMove: (e: TouchEvent) => {
            if (startYRef.current === null) return;
            const dy = e.touches[0].clientY - startYRef.current;
            setDragY(dy > 0 ? dy : 0);
        },
        onTouchEnd: () => {
            if (dragY > 90) onClose();
            setDragY(0);
            setDragging(false);
            startYRef.current = null;
        },
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 sm:hidden" aria-modal="true" role="dialog">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                style={{ animationDuration: '200ms' }}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="absolute bottom-0 left-0 right-0 rounded-t-lg board-panel animate-fade-in-up"
                style={{
                    animationDuration: '250ms',
                    transform: dragY ? `translateY(${dragY}px)` : undefined,
                    transition: dragging ? 'none' : 'transform 0.25s ease',
                }}
            >
                {/* Handle — drag down to dismiss */}
                <div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                    {...dragHandlers}
                >
                    <div className="w-10 h-1 rounded-full bg-neutral-600" />
                </div>

                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 touch-none"
                    {...dragHandlers}
                >
                    <div className="flex items-center gap-2 eyebrow text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        Select district
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-sm text-neutral-500 hover:text-foreground hover:bg-neutral-800/60 transition-colors"
                        aria-label="Close district selector"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Options */}
                <ul role="listbox" className="max-h-[60vh] overflow-auto py-2 px-2">
                    {DISTRICT_OPTIONS.map((district) => {
                        const selected = district.value === value;
                        return (
                            <li
                                key={district.value}
                                className={`
                                    relative flex items-center justify-between pl-4 pr-4 py-3.5 rounded-sm cursor-pointer select-none
                                    transition-colors duration-150
                                    ${selected
                                        ? 'bg-primary-500/10 text-primary-400'
                                        : 'text-neutral-300 active:bg-neutral-800/60'
                                    }
                                `}
                                role="option"
                                aria-selected={selected}
                                onClick={() => onChange(district.value)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-[11px] tabular ${selected ? 'text-primary-500' : 'text-neutral-600'}`}>
                                        {rowIndex(district.value)}
                                    </span>
                                    <span className="font-medium text-base">{district.label}</span>
                                </div>
                                {selected && <Check className="h-5 w-5 text-primary-500" aria-hidden="true" />}
                            </li>
                        );
                    })}
                </ul>

                {/* Safe area padding for bottom (notched phones) */}
                <div style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} />
            </div>
        </div>
    );
}
