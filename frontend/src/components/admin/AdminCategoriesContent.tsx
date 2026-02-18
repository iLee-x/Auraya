"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Category } from "@/types";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string | null;
}

const emptyForm: CategoryFormData = { name: "", description: "", parentId: null };

export default function AdminCategoriesContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () =>
      api.get<{ categories: Category[] }>("/categories", {
        params: { flat: "true" },
      }),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      api.post("/categories", {
        name: data.name,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      api.patch(`/categories/${id}`, {
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const categories = data?.categories ?? [];

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      parentId: cat.parentId,
    });
    setEditingId(cat.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (authLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Categories</h1>
        </div>
        {!showForm && (
          <Button className="rounded-full" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Category
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Parent Category</label>
              <select
                value={form.parentId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parentId: e.target.value || null,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">None (Top-level)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="rounded-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-12 text-muted-foreground">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-muted-foreground">
                  /{cat.slug}
                  {cat.parent && (
                    <span> &middot; Parent: {cat.parent.name}</span>
                  )}
                </p>
                {cat.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => startEdit(cat)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
