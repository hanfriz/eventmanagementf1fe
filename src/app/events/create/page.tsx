"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import {
  Calendar,
  MapPin,
  Users,
  Banknote,
  Tag,
  FileText,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { EventCategory } from "@/types";
import { eventsAPI, uploadAPI } from "@/lib/api";
import { useRoleProtection } from "@/hooks";
import toast from "react-hot-toast";

export default function CreateEventPage() {
  const router = useRouter();

  // Role protection - only ORGANIZER and ADMIN can access this page
  const { isAuthorized, isLoading: authLoading } = useRoleProtection([
    "ORGANIZER",
    "ADMIN",
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "upload">(
    "url"
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  // Get tomorrow's date in YYYY-MM-DDTHH:MM format for datetime-local input
  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const minDateTime = getTomorrowDateTime();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    endDate: "",
    price: 0,
    totalSeats: 1,
    isFree: false,
    image: "",
    tags: [] as string[],
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if user is not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You need ORGANIZER role to access this page.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const categoryOptions = [
    { value: "", label: "Select Category" },
    { value: EventCategory.TECHNOLOGY, label: "Technology" },
    { value: EventCategory.BUSINESS, label: "Business" },
    { value: EventCategory.EDUCATION, label: "Education" },
    { value: EventCategory.ENTERTAINMENT, label: "Entertainment" },
    { value: EventCategory.SPORTS, label: "Sports" },
    { value: EventCategory.ART, label: "Art & Culture" },
    { value: EventCategory.HEALTH, label: "Health & Wellness" },
    { value: EventCategory.TRAVEL, label: "Travel" },
    { value: EventCategory.MUSIC, label: "Music" },
    { value: EventCategory.FOOD, label: "Food & Beverage" },
    { value: EventCategory.OTHER, label: "Other" },
  ];

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (formData.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return false;
    }
    if (formData.description.trim().length > 2000) {
      toast.error("Description must be no more than 2000 characters");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!formData.startDate) {
      toast.error("Start date is required");
      return false;
    }
    if (!formData.endDate) {
      toast.error("End date is required");
      return false;
    }
    if (!formData.isFree && formData.price <= 0) {
      toast.error("Price must be greater than 0 for paid events");
      return false;
    }
    if (formData.totalSeats < 1) {
      toast.error("Total seats must be at least 1");
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return false;
    }
    if (new Date(formData.startDate) < new Date()) {
      toast.error("Start date must be in the future");
      return false;
    }
    return true;
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsImageUploading(true);

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file must be smaller than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const result = await uploadAPI.uploadImage(file);

      setUploadedImageData({
        url: result.url,
        publicId: result.publicId,
      });

      handleInputChange("image", result.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageUrlValidation = async (url: string) => {
    if (!url.trim()) return;

    try {
      await uploadAPI.validateImageUrl(url);
      toast.success("Image URL is valid!");
    } catch (error) {
      console.error("URL validation error:", error);
      toast.error("Invalid image URL. Please check the URL and try again.");
      handleInputChange("image", "");
    }
  };

  const clearUploadedImage = async () => {
    if (uploadedImageData?.publicId) {
      try {
        await uploadAPI.deleteImage(uploadedImageData.publicId);
      } catch (error) {
        console.error("Failed to delete uploaded image:", error);
      }
    }
    setUploadedImageData(null);
    handleInputChange("image", "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Convert dates to ISO format for API
      const startDateTime = new Date(formData.startDate).toISOString();
      const endDateTime = new Date(formData.endDate).toISOString();

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as EventCategory,
        location: formData.location.trim(),
        startDate: startDateTime,
        endDate: endDateTime,
        price: formData.isFree ? 0 : formData.price,
        totalSeats: formData.totalSeats,
        isFree: formData.isFree,
        image: formData.image || undefined, // Include image URL if provided
        tags: formData.tags,
      };

      const response = await eventsAPI.createEvent(eventData);

      toast.success("Event created successfully!");

      // Backend returns { message: "Event created successfully", event: {...} }
      // Redirect to the newly created event detail page
      if (response.event?.id) {
        router.push(`/events/${response.event.id}`);
      } else {
        // Fallback to events list if no event ID is returned
        router.push("/events");
      }
    } catch (error) {
      console.error("Create event error:", error);

      // Handle validation errors from the backend
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = (
          error as {
            response?: {
              data?: { error?: Array<{ msg?: string }>; message?: string };
            };
          }
        ).response?.data;

        if (
          errorResponse &&
          errorResponse.error &&
          Array.isArray(errorResponse.error)
        ) {
          // Display each validation error as a separate toast
          errorResponse.error.forEach((validationError: { msg?: string }) => {
            if (validationError.msg) {
              toast.error(validationError.msg);
            }
          });
          return;
        } else if (errorResponse && errorResponse.message) {
          toast.error(errorResponse.message);
          return;
        }
      }

      // Fallback error message
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/events"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Event
            </h1>
            <p className="text-gray-600">
              Fill in the details below to create a new event
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Title *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className="pl-10"
                        placeholder="Enter event title"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      placeholder="Describe your event..."
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/2000 characters (minimum 10)
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      options={categoryOptions}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="pl-10"
                        placeholder="Event location"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Event Image (Optional)
                    </label>

                    {/* Image Upload Method Selection */}
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageMethod"
                          value="url"
                          checked={imageUploadMethod === "url"}
                          onChange={(e) =>
                            setImageUploadMethod(
                              e.target.value as "url" | "upload"
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Image URL</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageMethod"
                          value="upload"
                          checked={imageUploadMethod === "upload"}
                          onChange={(e) =>
                            setImageUploadMethod(
                              e.target.value as "url" | "upload"
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Upload File
                        </span>
                      </label>
                    </div>

                    {/* URL Input */}
                    {imageUploadMethod === "url" && (
                      <div className="space-y-2">
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          <Input
                            id="imageUrl"
                            type="url"
                            value={formData.image}
                            onChange={(e) =>
                              handleInputChange("image", e.target.value)
                            }
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (value) {
                                handleImageUrlValidation(value);
                              }
                            }}
                            className="pl-10"
                            placeholder="https://example.com/event-image.jpg"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Enter a valid image URL. The URL will be validated
                          automatically.
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    {imageUploadMethod === "upload" && (
                      <div className="space-y-3">
                        {!uploadedImageData ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-4">
                              <label
                                htmlFor="imageFile"
                                className="cursor-pointer"
                              >
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Click to upload or drag and drop
                                </span>
                                <span className="mt-1 block text-xs text-gray-500">
                                  PNG, JPG, GIF up to 5MB
                                </span>
                                <input
                                  id="imageFile"
                                  name="imageFile"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(file);
                                    }
                                  }}
                                  disabled={isImageUploading}
                                />
                              </label>
                            </div>
                            {isImageUploading && (
                              <div className="mt-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Uploading...
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <svg
                                  className="h-5 w-5 text-green-600 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-green-800">
                                  Image uploaded successfully
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearUploadedImage}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                            {uploadedImageData.url && (
                              <div className="mt-3">
                                <OptimizedImage
                                  src={uploadedImageData.url}
                                  alt="Event preview"
                                  width={128}
                                  height={128}
                                  className="h-32 w-auto rounded border object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Date & Time
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Date & Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="startDate"
                        type="datetime-local"
                        required
                        min={minDateTime}
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Date & Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        required
                        min={minDateTime}
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Pricing & Capacity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="totalSeats"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Total Seats *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="totalSeats"
                        type="number"
                        min="1"
                        required
                        value={formData.totalSeats}
                        onChange={(e) =>
                          handleInputChange(
                            "totalSeats",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="pl-10"
                        placeholder="Number of seats"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <Checkbox
                        id="isFree"
                        checked={formData.isFree}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleInputChange("isFree", checked);
                          if (checked) {
                            handleInputChange("price", 0);
                          }
                        }}
                      />
                      <label
                        htmlFor="isFree"
                        className="text-sm font-medium text-gray-700"
                      >
                        This is a free event
                      </label>
                    </div>

                    {!formData.isFree && (
                      <div>
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Price (IDR) *
                        </label>
                        <div className="relative">
                          <Banknote className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="1000"
                            required={!formData.isFree}
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange(
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="pl-10"
                            placeholder="Event price"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tags
                </h2>
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                        placeholder="Enter tag and press Enter"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="info"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                            title={`Remove ${tag} tag`}
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
