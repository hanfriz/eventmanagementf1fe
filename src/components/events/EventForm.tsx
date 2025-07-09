"use client";

import React, { useState } from "react";
import { EventFormData, EventCategory } from "@/types";
import { Input, Textarea, Select, Button, Checkbox } from "@/components/ui";
import { locations } from "@/data/events";
import {
  formLabels,
  buttonTexts,
  placeholders,
  errorMessages,
  uiTexts,
  tooltips,
} from "@/content";

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: EventCategory.TECHNOLOGY,
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    price: 0,
    totalSeats: 0,
    isFree: false,
    tags: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = errorMessages.titleRequired;
    }

    if (!formData.description.trim()) {
      newErrors.description = errorMessages.descriptionRequired;
    }

    if (!formData.location.trim()) {
      newErrors.location = errorMessages.locationRequired;
    }

    if (!formData.startDate) {
      newErrors.startDate = errorMessages.startDateRequired;
    }

    if (!formData.endDate) {
      newErrors.endDate = errorMessages.endDateRequired;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = errorMessages.endDateAfterStart;
    }

    if (!formData.startTime) {
      newErrors.startTime = errorMessages.startTimeRequired;
    }

    if (!formData.endTime) {
      newErrors.endTime = errorMessages.endTimeRequired;
    }

    if (
      formData.startDate === formData.endDate &&
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = errorMessages.endTimeAfterStart;
    }

    if (!formData.totalSeats || formData.totalSeats <= 0) {
      newErrors.totalSeats = errorMessages.totalSeatsRequired;
    }

    if (!formData.isFree && formData.price <= 0) {
      newErrors.price = errorMessages.priceRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const categoryOptions = Object.values(EventCategory).map((category) => ({
    value: category,
    label: category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

  const locationOptions = locations
    .filter((loc) => loc.name !== "All Locations")
    .map((loc) => ({
      value: loc.name,
      label: loc.name,
    }));

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      {" "}
      <h2 className="text-2xl font-bold mb-6">
        {initialData.title ? uiTexts.editEvent : uiTexts.createNewEvent}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          {" "}
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            {uiTexts.basicInformation}
          </h3>
          <Input
            label={formLabels.eventTitle}
            required
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            error={errors.title}
            placeholder={placeholders.eventTitle}
            title={tooltips.eventTitle}
          />
          <Textarea
            label={formLabels.eventDescription}
            required
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={errors.description}
            rows={4}
            placeholder={placeholders.eventDescription}
            title={tooltips.eventDescription}
          />
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <Select
              label={formLabels.category}
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              options={categoryOptions}
              error={errors.category}
            />
            <div className="space-y-2">
              <Input
                label={formLabels.location}
                required
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={errors.location}
                placeholder={placeholders.eventLocation}
              />
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value && e.target.value !== "All Locations") {
                    handleInputChange("location", e.target.value);
                  }
                }}
                options={[
                  { value: "", label: placeholders.selectPresetLocation },
                  ...locationOptions,
                ]}
                className="text-sm"
              />
            </div>
          </div>
        </div>{" "}
        {/* Date and Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            {uiTexts.dateTime}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {" "}
            <Input
              label={formLabels.startDate}
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              error={errors.startDate}
            />
            <Input
              label={formLabels.endDate}
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              error={errors.endDate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {" "}
            <Input
              label={formLabels.startTime}
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              error={errors.startTime}
            />
            <Input
              label={formLabels.endTime}
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              error={errors.endTime}
            />
          </div>
        </div>{" "}
        {/* Pricing and Capacity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            {uiTexts.pricingCapacity}
          </h3>

          <Checkbox
            label={formLabels.freeEvent}
            checked={formData.isFree}
            onChange={(e) => {
              const isFree = e.target.checked;
              handleInputChange("isFree", isFree);
              if (isFree) {
                handleInputChange("price", 0);
              }
            }}
          />

          {!formData.isFree && (
            <Input
              label={formLabels.price}
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseInt(e.target.value) || 0)
              }
              error={errors.price}
              placeholder={placeholders.enterTicketPrice}
            />
          )}

          <Input
            label={formLabels.totalSeats}
            type="number"
            min="1"
            required
            value={formData.totalSeats}
            onChange={(e) =>
              handleInputChange("totalSeats", parseInt(e.target.value) || 0)
            }
            error={errors.totalSeats}
            placeholder={placeholders.maximumAttendees}
          />
        </div>
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {" "}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {buttonTexts.cancel}
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {initialData.title
              ? buttonTexts.updateEvent
              : buttonTexts.createEvent}
          </Button>
        </div>
      </form>
    </div>
  );
};
