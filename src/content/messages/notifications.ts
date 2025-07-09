// Success messages
export const successMessages = {
  // Event Management
  eventCreated: "Event created successfully!",
  eventUpdated: "Event updated successfully!",
  eventDeleted: "Event deleted successfully!",
  eventPublished: "Event published successfully!",

  // Registration
  registrationSuccessful: "Registration successful!",
  registrationCancelled: "Registration cancelled successfully.",

  // Promotion
  promotionApplied: "Promotion code applied successfully!",
  promotionCreated: "Promotion created successfully!",

  // General
  changesSaved: "Changes saved successfully!",
  dataCopied: "Data copied to clipboard!",
  emailSent: "Email sent successfully!",
} as const;

// Info messages
export const infoMessages = {
  // Empty States
  noEventsFound: "No events found",
  noEventsAvailable: "No events available at the moment",
  tryAdjustingFilters: "Try adjusting your search criteria or filters",

  // Loading States
  loadingEvents: "Loading events...",
  savingEvent: "Saving event...",
  processingRegistration: "Processing registration...",

  // General Info
  comingSoon: "Coming soon!",
  featureNotAvailable: "This feature is not available yet",

  // Event Status
  eventUpcoming: "Event is upcoming",
  eventActive: "Event is currently active",
  eventEnded: "Event has ended",
} as const;
