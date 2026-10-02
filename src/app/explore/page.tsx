'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  FileText,
  RotateCcw,
  SlidersHorizontal,
  Radio
} from 'lucide-react';
import { repository } from '@/lib/db/repository';
import { EntityProfile, EntityCategory, RegistrationStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

const CATEGORIES: (EntityCategory | 'All')[] = [
  'All',
  'Algorithmic Trading',
  'Forex & CFD Broker',
  'Crypto Yield & Staking',
  'P2P Lending',
  'Advisory & Telegram Tipster',
  'Regulated Depository & Broker'
];

const REGISTRATION_STATUSES: (RegistrationStatus | 'All')[] = [
  'All',
  'SEBI Registered',
  'RBI Authorized',
  'Caution Listed by Regulator',
  'Unregistered'
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EntityCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RegistrationStatus | 'All'>('All');
  const [noticesOnly, setNoticesOnly] = useState(false);
  const [entities, setEntities] = useState<EntityProfile[]>([]);

  useEffect(() => {
    const list = repository.getEntities();
    setEntities(list);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setQuery(q);
      const cat = params.get('category') as EntityCategory;
      if (cat) setSelectedCategory(cat);
      if (params.get('notices') === 'true') setNoticesOnly(true);
    }
  }, []);

  const filteredEntities = useMemo(() => {
    return repository.searchEntities({
      query,
      category: selectedCategory,
      status: selectedStatus,
      hasNoticesOnly: noticesOnly
    });
  }, [query, selectedCategory, selectedStatus, noticesOnly]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setNoticesOnly(false);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#86928C] mb-2">
          <Link href="/" className="hover:text-[#044C4C] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#141A17] font-medium">Explore Directory</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#044C4C] uppercase tracking-wider mb-1">
              <span>Public Claim Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-headline font-bold text-[#141A17] tracking-tight">
              Tracked Organisations & Entities
            </h1>
            <p className="text-xs sm:text-sm text-[#525C56] mt-1 max-w-2xl">
              Public registry tracking investment platforms, advisers, brokers, and corporate statement histories.
            </p>
          </div>

          <div className="text-xs font-mono text-[#4B534E] bg-white px-3.5 py-2 rounded-full border border-[#D8DFDA] shadow-2xs self-start sm:self-auto">
            Showing <strong className="text-[#044C4C]">{filteredEntities.length}</strong> of {entities.length} Indexed Entities
          </div>
        </div>
      </div>

      {/* Real-Time Live Internet Search Callout */}
      <div className="bg-[#FAFBF9] border border-[#D5DFD8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-[#044C4C] animate-pulse shrink-0" />
          <span className="text-[#2C3531]">
            Looking for a breaking incident, executive statement, or topic that is not yet in the local registry?
          </span>
        </div>
        <Link
          href={query ? `/search?q=${encodeURIComponent(query)}` : '/search?q='}
          className="font-semibold text-white bg-[#044C4C] hover:bg-[#034343] px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <span>Search Live Internet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search and Filters Grid */}
      <div className="bg-white border border-[#E2E7E3] rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A958E] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by organisation name, alias, Telegram handle, or keyword..."
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAFBF9] focus:bg-white rounded-xl border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] transition-all"
          />
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#F0F3F1] text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-mono text-[#69746E] uppercase tracking-wider mb-1.5 font-bold">
              Entity Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full p-2 bg-[#FAFBF9] rounded-lg border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Status Filter */}
          <div>
            <label className="block text-[10px] font-mono text-[#69746E] uppercase tracking-wider mb-1.5 font-bold">
              Registration Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full p-2 bg-[#FAFBF9] rounded-lg border border-[#D5DFD8] focus:outline-none focus:border-[#044C4C] text-[#141A17] text-xs"
            >
              {REGISTRATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Official Notices Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-[#D5DFD8] hover:bg-[#FAFBF9] cursor-pointer text-[#2A332E]">
              <input
                type="checkbox"
                checked={noticesOnly}
                onChange={(e) => setNoticesOnly(e.target.checked)}
                className="rounded border-[#D5DFD8] text-[#044C4C] focus:ring-0"
              />
              <span className="text-xs font-medium">Regulatory Notice Active</span>
            </label>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 text-xs text-[#4B534E] hover:text-[#044C4C] border border-[#D5DFD8] hover:bg-[#FAFBF9] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredEntities.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E2E7E3] rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#E6F2F2] flex items-center justify-center mx-auto text-[#044C4C]">
            <Radio className="w-6 h-6 animate-pulse text-[#044C4C]" />
          </div>
          <h3 className="text-base font-bold font-serif-headline text-[#141A17]">
            {query ? `"${query}" is not yet in the local registry` : 'Query is not yet in the local registry'}
          </h3>
          <p className="text-xs text-[#525C56] max-w-md mx-auto">
            VERITY's on-demand intelligence engine can search the live internet right now, discover public articles, extract factual claims, and analyze this incident on the spot.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#044C4C] hover:bg-[#034343] rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{query ? `Run Real-Time Web Search for "${query}"` : 'Run Real-Time Web Search on Live Internet'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-[#4B534E] bg-[#F0F7F7] hover:bg-[#E6F2F2] rounded-full transition-colors cursor-pointer"
            >
              Clear filters
            </button>
            <Link
              href="/submit"
              className="px-4 py-2 text-xs font-semibold text-[#044C4C] border border-[#044C4C] hover:bg-[#E6F2F2] rounded-full transition-colors"
            >
              Contribute Statement
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntities.map((entity, idx) => (
            <div
              key={entity.id}
              className="p-6 rounded-2xl bg-white border border-[#E2E7E3] hover:border-[#044C4C] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-[#5B237E] text-white'
                          : idx === 1
                          ? 'bg-[#002E6E] text-[#00BAF2]'
                          : idx === 2
                          ? 'bg-[#044C4C] text-white'
                          : 'bg-[#1E5799] text-white'
                      }`}
                    >
                      {entity.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-[#717C76] uppercase tracking-wider block font-semibold">
                        {entity.category}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={entity.verificationBadge} size="sm" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#141A17] hover:text-[#044C4C] transition-colors leading-snug">
                    <Link href={`/entity/${entity.slug}`}>{entity.name}</Link>
                  </h2>
                  {entity.aliases.length > 0 && (
                    <div className="text-[11px] text-[#86928C] font-mono mt-0.5">
                      Aliases: {entity.aliases.join(', ')}
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#525C56] leading-relaxed line-clamp-3">
                  {entity.shortDescription}
                </p>

                {/* Active Notice Alert Pill if present */}
                {entity.notices.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="font-bold text-[11px]">{entity.notices[0].regulator}:</span>
                      <span className="truncate text-[11px]">{entity.notices[0].headline}</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-700 shrink-0">
                      {entity.notices[0].dateIssued}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Metadata & CTA */}
              <div className="pt-3 border-t border-[#F5F7F5] flex items-center justify-between text-xs">
                <div className="text-[11px] font-mono text-[#86928C]">
                  <span>{entity.sources.length} Sources</span>
                  <span className="mx-1.5">•</span>
                  <span>{entity.revisions.length} Revisions</span>
                </div>

                <Link
                  href={`/entity/${entity.slug}`}
                  className="font-semibold text-[#044C4C] hover:underline flex items-center gap-1"
                >
                  <span>Explore dossier</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
