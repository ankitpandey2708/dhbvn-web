'use client';

import React from 'react';
import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchAndDownloadControlsProps {
    globalFilter: string;
    setGlobalFilter: (v: string) => void;
    handleDownloadPDF: () => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    className?: string;
}

export function SearchAndDownloadControls({
    globalFilter,
    setGlobalFilter,
    handleDownloadPDF,
    searchInputRef,
    className = "",
}: SearchAndDownloadControlsProps) {
    return (
        <div className={`flex items-center justify-between py-4 ${className}`}>
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                <Input
                    ref={searchInputRef}
                    type="search"
                    inputMode="search"
                    placeholder="Search area or feeder..."
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="pl-11"
                    aria-label="Search by area or feeder"
                />
            </div>
            <Button
                onClick={handleDownloadPDF}
                variant="secondary"
                size="default"
                className="shrink-0 ml-3"
                aria-label="Download filtered results as PDF"
            >
                <Download className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
            </Button>
        </div>
    );
}
