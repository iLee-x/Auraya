"use client";

import type { Address } from "@/types";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AddressCard({
  address,
  isSelected,
  onSelect,
}: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 border rounded-lg transition-colors",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-muted-foreground/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-medium">{address.recipientName}</p>
          {address.phone && (
            <p className="text-sm text-muted-foreground">{address.phone}</p>
          )}
          <p className="text-sm">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm">
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="text-sm">{address.country}</p>
        </div>
        <div
          className={cn(
            "mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0",
            isSelected ? "border-primary bg-primary" : "border-muted-foreground/50"
          )}
        />
      </div>
      {address.isDefault && (
        <span className="inline-block mt-2 text-xs text-primary font-medium">
          Default
        </span>
      )}
    </button>
  );
}
