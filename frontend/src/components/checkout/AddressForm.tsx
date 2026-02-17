"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressFormData {
  recipientName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>;
  isLoading: boolean;
}

export default function AddressForm({ onSubmit, isLoading }: AddressFormProps) {
  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      phone: form.phone || null,
      addressLine2: form.addressLine2 || null,
      isDefault: false,
    });
    setForm({
      recipientName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Recipient name *"
        value={form.recipientName}
        onChange={(e) => update("recipientName", e.target.value)}
        required
      />
      <Input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <Input
        placeholder="Address line 1 *"
        value={form.addressLine1}
        onChange={(e) => update("addressLine1", e.target.value)}
        required
      />
      <Input
        placeholder="Address line 2"
        value={form.addressLine2}
        onChange={(e) => update("addressLine2", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="City *"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          required
        />
        <Input
          placeholder="State *"
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Postal code *"
          value={form.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          required
        />
        <Input
          placeholder="Country *"
          value={form.country}
          onChange={(e) => update("country", e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Address"}
      </Button>
    </form>
  );
}
