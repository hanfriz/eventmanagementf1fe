export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeString: string): string => {
  return timeString;
};

export const calculateDiscountedPrice = (
  originalPrice: number,
  discountPercent: number
): number => {
  return originalPrice * (1 - discountPercent / 100);
};

export const isEventUpcoming = (startDate: string): boolean => {
  return new Date(startDate) > new Date();
};

export const isEventActive = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
};

export const getEventStatus = (
  startDate: string,
  endDate: string
): "upcoming" | "active" | "ended" => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > now) return "upcoming";
  if (start <= now && end >= now) return "active";
  return "ended";
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const generateEventSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
