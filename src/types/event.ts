import { EventCategory } from "./index";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  image: string;
  organizer: string;
  isFree: boolean;
  isPromoted?: boolean;
  promotion?: Promotion;
  tags?: string[];
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  discountPercent: number;
  validUntil: string;
  code: string;
  maxUses?: number;
  currentUses?: number;
  minPurchase?: number;
}

export interface EventFormData {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  totalSeats: number;
  isFree: boolean;
  tags?: string[];
  promotion?: Partial<Promotion>;
}

export interface EventFilters {
  searchTerm: string;
  category: EventCategory | string;
  location: string;
  priceRange: PriceRange;
  dateRange: DateRange;
  isPromotionOnly: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type SortBy = "date" | "price" | "popularity" | "newest";

export interface EventCategoryInfo {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  province: string;
}
