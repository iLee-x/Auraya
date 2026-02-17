"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, MapPin, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import AddressForm from "./AddressForm";
import type { Address } from "@/types";

export default function AccountPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Name editing state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState("");

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.get<{ addresses: Address[] }>("/addresses"),
    enabled: isAuthenticated,
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) =>
      api.patch<{ user: { name: string } }>("/auth/me", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setEditingName(false);
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, "id" | "userId">) =>
      api.post<{ address: Address }>("/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowAddressForm(false);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Address> & { id: string }) =>
      api.patch<{ address: Address }>(`/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingAddress(null);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleStartEditName = () => {
    setNameValue(user?.name ?? "");
    setNameError("");
    setEditingName(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) {
      setNameError("Name is required");
      return;
    }
    try {
      await updateNameMutation.mutateAsync(nameValue.trim());
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to update name");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const addresses = addressesQuery.data?.addresses ?? [];

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Name</span>
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <Input
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setNameError("");
                  }}
                  className="h-8 w-48"
                  autoFocus
                />
                <Button type="submit" size="sm" disabled={updateNameMutation.isPending}>
                  {updateNameMutation.isPending ? "..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name || "—"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleStartEditName}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          {nameError && (
            <p className="text-red-500 text-xs text-right">{nameError}</p>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </section>

      {/* Addresses Section */}
      <section className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Addresses</h2>
          </div>
          {!showAddressForm && !editingAddress && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowAddressForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Address
            </Button>
          )}
        </div>

        {/* Add Address Form */}
        {showAddressForm && (
          <div className="border rounded-md p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3">New Address</h3>
            <AddressForm
              onSubmit={async (data) => {
                await createAddressMutation.mutateAsync(data as Omit<Address, "id" | "userId">);
              }}
              onCancel={() => setShowAddressForm(false)}
            />
          </div>
        )}

        {/* Edit Address Form */}
        {editingAddress && (
          <div className="border rounded-md p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3">Edit Address</h3>
            <AddressForm
              address={editingAddress}
              onSubmit={async (data) => {
                await updateAddressMutation.mutateAsync({
                  id: editingAddress.id,
                  ...data,
                } as Partial<Address> & { id: string });
              }}
              onCancel={() => setEditingAddress(null)}
            />
          </div>
        )}

        {addressesQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : addresses.length === 0 && !showAddressForm ? (
          <p className="text-sm text-gray-500">No saved addresses.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border rounded-md p-4 text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(addr);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      disabled={deleteAddressMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-gray-600">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-gray-600">{addr.country}</p>
                {addr.phone && <p className="text-gray-500">{addr.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="space-y-2">
          <Link
            href="/orders"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Package className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">My Orders</span>
          </Link>
        </div>
      </section>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-full h-11"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
