"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Percent, Users, Banknote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreatePromotionDTO, UpdatePromotionDTO, Promotion } from "@/types";
import toast from "react-hot-toast";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionDTO | UpdatePromotionDTO) => Promise<void>;
  eventId?: string;
  promotion?: Promotion | null;
  mode: "create" | "edit";
}

export default function PromotionModal({
  isOpen,
  onClose,
  onSubmit,
  eventId,
  promotion,
  mode,
}: PromotionModalProps) {
  const [formData, setFormData] = useState<CreatePromotionDTO>({
    code: "",
    discountPercent: 10,
    validUntil: "",
    maxUses: undefined,
    minPurchase: undefined,
    eventId: eventId,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (mode === "edit" && promotion) {
      setFormData({
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        validUntil: new Date(promotion.validUntil).toISOString().slice(0, 16),
        maxUses: promotion.maxUses || undefined,
        minPurchase: promotion.minPurchase || undefined,
        eventId: eventId,
      });
    } else if (mode === "create") {
      setFormData({
        code: "",
        discountPercent: 10,
        validUntil: "",
        maxUses: undefined,
        minPurchase: undefined,
        eventId: eventId,
      });
    }
  }, [mode, promotion, eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "discountPercent" ||
        name === "maxUses" ||
        name === "minPurchase"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error("Promotion code is required");
      return;
    }

    if (formData.discountPercent < 1 || formData.discountPercent > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    if (!formData.validUntil) {
      toast.error("Valid until date is required");
      return;
    }

    // Check if valid until is in the future
    if (new Date(formData.validUntil) <= new Date()) {
      toast.error("Valid until date must be in the future");
      return;
    }

    if (formData.maxUses && formData.maxUses < 1) {
      toast.error("Max uses must be at least 1");
      return;
    }

    if (formData.minPurchase && formData.minPurchase < 0) {
      toast.error("Minimum purchase cannot be negative");
      return;
    }

    try {
      setIsLoading(true);

      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };

      await onSubmit(submitData);
      onClose();
      // Success toast is handled by parent component
    } catch (error) {
      console.error("Error submitting promotion:", error);
      toast.error(`Failed to ${mode} promotion`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "create" ? "Create New Promotion" : "Edit Promotion"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Promotion Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Code *
            </label>
            <Input
              name="code"
              type="text"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., EARLY2025"
              disabled={mode === "edit"}
              className="uppercase"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Only uppercase letters, numbers, and underscores allowed
            </p>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="discountPercent"
                type="number"
                min="1"
                max="100"
                value={formData.discountPercent}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="validUntil"
                type="datetime-local"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Uses (Optional)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="maxUses"
                type="number"
                min="1"
                value={formData.maxUses || ""}
                onChange={handleInputChange}
                placeholder="Unlimited"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited uses
            </p>
          </div>

          {/* Minimum Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Purchase (Optional)
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="minPurchase"
                type="number"
                min="0"
                step="1000"
                value={formData.minPurchase || ""}
                onChange={handleInputChange}
                placeholder="No minimum"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum purchase amount in IDR
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "create"
                ? "Create Promotion"
                : "Update Promotion"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
