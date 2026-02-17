"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@/types";

interface AddressFormData {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<AddressFormData>({
    recipientName: address?.recipientName ?? "",
    phone: address?.phone ?? "",
    addressLine1: address?.addressLine1 ?? "",
    addressLine2: address?.addressLine2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postalCode: address?.postalCode ?? "",
    country: address?.country ?? "",
    isDefault: address?.isDefault ?? false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Recipient Name *</label>
          <Input
            value={form.recipientName}
            onChange={(e) => handleChange("recipientName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Address Line 1 *</label>
        <Input
          value={form.addressLine1}
          onChange={(e) => handleChange("addressLine1", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Address Line 2</label>
        <Input
          value={form.addressLine2}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">City *</label>
          <Input
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">State *</label>
          <Input
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Postal Code *</label>
          <Input
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Country *</label>
          <Input
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
          className="rounded border-gray-300"
        />
        Set as default address
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-full" disabled={loading}>
          {loading ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
