"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  Calendar,
  Percent,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Promotion } from "@/types";
import { format } from "date-fns";

interface PromotionListProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  onToggleStatus: (promotionId: string, isActive: boolean) => void;
}

export default function PromotionList({
  promotions,
  onEdit,
  onDelete,
  onToggleStatus,
}: PromotionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    promotionId: string | null;
    promotionCode: string;
  }>({
    isOpen: false,
    promotionId: null,
    promotionCode: "",
  });

  const handleDeleteClick = (promotionId: string, promotionCode: string) => {
    setDeleteModal({
      isOpen: true,
      promotionId,
      promotionCode,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.promotionId) return;

    setDeletingId(deleteModal.promotionId);
    try {
      await onDelete(deleteModal.promotionId);
      setDeleteModal({ isOpen: false, promotionId: null, promotionCode: "" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    if (deletingId) return; // Prevent closing while deleting
    setDeleteModal({ isOpen: false, promotionId: null, promotionCode: "" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (promotions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No promotions created yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <Card key={promotion.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {promotion.code}
                </h3>
                <Badge
                  variant={promotion.isActive ? "success" : "default"}
                  className={!promotion.isActive ? "opacity-50" : ""}
                >
                  {promotion.isActive ? "Active" : "Inactive"}
                </Badge>
                {new Date(promotion.validUntil) < new Date() && (
                  <Badge variant="error">Expired</Badge>
                )}
                {promotion.maxUses &&
                  promotion.currentUses >= promotion.maxUses && (
                    <Badge variant="warning">Used Up</Badge>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:w-full gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Percent className="h-4 w-4" />
                  <span>{promotion.discountPercent}% off</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Until{" "}
                    {format(new Date(promotion.validUntil), "MMM dd, yyyy")}
                  </span>
                </div>

                {promotion.maxUses && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {promotion.currentUses}/{promotion.maxUses} used
                    </span>
                  </div>
                )}

                {promotion.minPurchase && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Min: {formatPrice(promotion.minPurchase)}</span>
                  </div>
                )}
              </div>

              {promotion.event && (
                <div className="text-sm text-gray-600 mb-2">
                  Event:{" "}
                  <span className="font-medium">{promotion.event.title}</span>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Created:{" "}
                {format(new Date(promotion.createdAt), "MMM dd, yyyy HH:mm")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onToggleStatus(promotion.id, !promotion.isActive)
                }
                title={
                  promotion.isActive
                    ? "Deactivate promotion"
                    : "Activate promotion"
                }
              >
                {promotion.isActive ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(promotion)}
                title="Edit promotion"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(promotion.id, promotion.code)}
                disabled={deletingId === promotion.id}
                title="Delete promotion"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        message={`Are you sure you want to delete the promotion "${deleteModal.promotionCode}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingId === deleteModal.promotionId}
      />
    </div>
  );
}
