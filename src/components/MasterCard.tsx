"use client";

import Image from "next/image";
import type { Master } from "@/data/content";
import Badge from "@/components/ui/Badge";
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
      className={`${CARD_HOVER} focus-ring relative h-[168px] w-full shrink-0 overflow-hidden rounded-lg text-left sm:h-[180px]`}
    >
      <Image
        src={master.bgImage}
        alt={master.name}
        fill
        unoptimized
        sizes="320px"
        className="object-cover brightness-105 transition-transform duration-700 ease-luxury group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10 transition-colors duration-300 group-hover:from-black/75" />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium tracking-wide text-white">
              {master.name}
            </h3>
            <p className="mt-0.5 text-label-sm text-white/60">
              {master.role}
            </p>
          </div>
          <Badge className="shrink-0 bg-black/50 text-white/80 backdrop-blur-sm">
            {master.badge}
          </Badge>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40 transition-all group-hover:ring-gold">
            <Image
              src={master.avatar}
              alt={`${master.name} portrait`}
              fill
              unoptimized
              sizes="44px"
              className="object-cover brightness-110"
            />
          </div>
          <span className="rounded-full bg-black/55 px-3 py-1.5 text-label-sm text-white/80 backdrop-blur-sm transition-colors group-hover:bg-bordeaux group-hover:text-white">
            Reserve
          </span>
        </div>
      </div>
    </button>
  );
}
