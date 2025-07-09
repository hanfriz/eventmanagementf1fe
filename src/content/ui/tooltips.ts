// Tooltip and help texts
export const tooltips = {
  // Form Field Tooltips
  eventTitle: "Enter a descriptive title for the event",
  eventDescription: "Provide a brief description of the event",
  startDate: "Start date must be before end date",
  endDate: "End date must be after start date",
  startTime: "Start time must be before end time",
  endTime: "End time must be after start time",
  price: "Enter 0 for free events",
  totalSeats: "Total seats available for the event",

  // Filter Tooltips
  filterByCategory: "Filter events by category",
  filterByLocation: "Filter events by location",

  // Button Tooltips
  clearFilters: "Clear all active filters",
  generateCode: "Generate a random promotion code",

  // Icon Tooltips
  calendar: "Event date",
  clock: "Event time",
  location: "Event location",
  users: "Available seats",
  tag: "Discount available",
} as const;
