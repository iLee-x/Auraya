"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  MapPin,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  ChevronRight,
  User,
  Mail,
  Shield,
  Calendar,
} from "lucide-react";
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
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const addresses = addressesQuery.data?.addresses ?? [];
  const initials = (user.name || user.email)
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <Input
                    value={nameValue}
                    onChange={(e) => {
                      setNameValue(e.target.value);
                      setNameError("");
                    }}
                    className="h-9 max-w-[200px] text-sm"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 rounded-full text-xs"
                    disabled={updateNameMutation.isPending}
                  >
                    {updateNameMutation.isPending ? "..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => setEditingName(false)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {user.name || "Unnamed"}
                  </h1>
                  <button
                    onClick={handleStartEditName}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
              <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-9 text-xs font-medium text-gray-500 hover:text-red-600 hover:border-red-200 gap-1.5 hidden sm:flex"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
        {/* Profile Details */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Profile Details</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || "---"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Member since</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Addresses Section */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">
                Saved Addresses
              </h2>
            </div>
            {!showAddressForm && !editingAddress && (
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                onClick={() => setShowAddressForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add New
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Add Address Form */}
            {showAddressForm && (
              <div className="bg-gray-50 rounded-lg p-5 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  New Address
                </h3>
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
              <div className="bg-gray-50 rounded-lg p-5 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Edit Address
                </h3>
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
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
              </div>
            ) : addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No saved addresses yet</p>
                <button
                  className="text-xs font-medium text-gray-900 mt-2 hover:underline"
                  onClick={() => setShowAddressForm(true)}
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {addr.recipientName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-sm text-gray-500">{addr.country}</p>
                        {addr.phone && (
                          <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(addr);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          onClick={() => deleteAddressMutation.mutate(addr.id)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Quick Links</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <Link
              href="/orders"
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 flex-1">
                My Orders
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          </div>

          {user.role === "ADMIN" && (
            <>
              <div className="px-6 py-3 border-t border-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">
                  Admin
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                <Link
                  href="/account/products"
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    Manage Products
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
                <Link
                  href="/account/categories"
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <FolderTree className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    Manage Categories
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    All Orders
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Mobile Sign Out */}
        <Button
          variant="outline"
          className="w-full rounded-full h-11 text-xs font-medium text-gray-500 hover:text-red-600 hover:border-red-200 sm:hidden"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
