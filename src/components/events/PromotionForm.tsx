"use client";

import React, { useState } from "react";
import { Input, Checkbox, Button } from "@/components/ui";
import { Promotion } from "@/types";
import { formLabels, buttonTexts, placeholders, uiTexts } from "@/content";

interface PromotionFormProps {
  promotion?: Partial<Promotion>;
  onPromotionChange: (promotion: Partial<Promotion> | undefined) => void;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  promotion = {},
  onPromotionChange,
  isEnabled,
  onEnabledChange,
}) => {
  const [formData, setFormData] = useState<Partial<Promotion>>(promotion);

  const handleChange = (field: keyof Promotion, value: string | number) => {
    const updatedPromotion = {
      ...formData,
      [field]: value,
    };
    setFormData(updatedPromotion);
    onPromotionChange(updatedPromotion);
  };

  const handleEnabledToggle = (enabled: boolean) => {
    onEnabledChange(enabled);
    if (!enabled) {
      onPromotionChange(undefined);
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    handleChange("code", code);
  };

  return (
    <div className="space-y-4">
      {" "}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {uiTexts.promotionSettings}
        </h3>
        <Checkbox
          label={formLabels.enablePromotion}
          checked={isEnabled}
          onChange={(e) => handleEnabledToggle(e.target.checked)}
        />
      </div>
      {isEnabled && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <Input
              label={formLabels.discountPercentage}
              type="number"
              min="1"
              max="99"
              value={formData.discountPercent || ""}
              onChange={(e) =>
                handleChange("discountPercent", parseInt(e.target.value) || 0)
              }
              placeholder={placeholders.discountPercent}
            />
            <div className="space-y-2">
              {" "}
              <Input
                label={formLabels.promoCode}
                value={formData.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder={placeholders.promoCode}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateCode}
                className="w-full"
              >
                {buttonTexts.generateCode}
              </Button>
            </div>
          </div>{" "}
          <Input
            label={formLabels.validUntil}
            type="date"
            value={formData.validUntil || ""}
            onChange={(e) => handleChange("validUntil", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={formLabels.maximumUses}
              type="number"
              min="1"
              value={formData.maxUses || ""}
              onChange={(e) =>
                handleChange("maxUses", parseInt(e.target.value) || 0)
              }
              placeholder={formLabels.optional}
            />

            <Input
              label={formLabels.minimumPurchase}
              type="number"
              min="0"
              value={formData.minPurchase || ""}
              onChange={(e) =>
                handleChange("minPurchase", parseInt(e.target.value) || 0)
              }
              placeholder={formLabels.optional}
            />
          </div>
        </div>
      )}
    </div>
  );
};
