// Error messages
export const errorMessages = {
  // Required Field Errors
  titleRequired: "Event title is required",
  descriptionRequired: "Event description is required",
  locationRequired: "Event location is required",
  startDateRequired: "Start date is required",
  endDateRequired: "End date is required",
  startTimeRequired: "Start time is required",
  endTimeRequired: "End time is required",
  totalSeatsRequired: "Total seats must be greater than 0",
  priceRequired: "Price must be greater than 0 for paid events",

  // Validation Errors
  endDateAfterStart: "End date must be after start date",
  endTimeAfterStart: "End time must be after start time for same-day events",
  invalidEmail: "Please enter a valid email address",
  invalidDate: "Please enter a valid date",
  invalidTime: "Please enter a valid time",

  // General Errors
  somethingWentWrong: "Something went wrong. Please try again.",
  networkError: "Network error. Please check your connection.",
  serverError: "Server error. Please try again later.",

  // Form Errors
  fillRequiredFields: "Please fill in all required fields",
  invalidForm: "Please check your form inputs",
} as const;
