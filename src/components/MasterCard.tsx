"use client";

import Image from "next/image";
import type { Master } from "@/data/content";
import { CARD_HOVER } from "@/lib/interactive";

interface MasterCardProps {
  master: Master;
  onSelect: () => void;
}

export default function MasterCard({ master, onSelect }: MasterCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Book with ${master.name}`}
      className={`${CARD_HOVER} relative h-[168px] w-full shrink-0 overflow-hidden rounded-2xl text-left sm:h-[180px]`}
    >
      <Image
        src={master.bgImage}
        alt={master.name}
        fill
        unoptimized
        sizes="320px"
        className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/20 transition-colors duration-300 group-hover:from-black/65" />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium tracking-wide text-white">
              {master.name}
            </h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/60">
              {master.role}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
            {master.badge}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 transition-all group-hover:ring-gold/40">
            <Image
              src={master.avatar}
              alt={`${master.name} portrait`}
              fill
              unoptimized
              sizes="44px"
              className="object-cover"
            />
          </div>
          <span className="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm transition-colors group-hover:bg-bordeaux group-hover:text-white">
            Reserve
          </span>
        </div>
      </div>
    </button>
  );
}
