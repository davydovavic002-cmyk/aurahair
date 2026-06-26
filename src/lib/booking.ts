import type { HotSlot, Master } from "@/data/content";

export interface BookingIntent {
  slot?: HotSlot;
  master?: Master;
  serviceName?: string;
}
