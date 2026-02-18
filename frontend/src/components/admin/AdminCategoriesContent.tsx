"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Category } from "@/types";

interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children?: CategoryTreeNode[];
}

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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Tree data for display
  const { data: treeData, isLoading } = useQuery({
    queryKey: ["admin", "categories", "tree"],
    queryFn: () => api.get<{ categories: CategoryTreeNode[] }>("/categories"),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Flat data for parent select in form
  const { data: flatData } = useQuery({
    queryKey: ["admin", "categories", "flat"],
    queryFn: () =>
      api.get<{ categories: Category[] }>("/categories", {
        params: { flat: "true" },
      }),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      api.post("/categories", {
        name: data.name,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
      }),
    onSuccess: () => {
      invalidateAll();
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
      invalidateAll();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: invalidateAll,
  });

  const treeCategories = treeData?.categories ?? [];
  const flatCategories = flatData?.categories ?? [];

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const startCreate = (parentId: string | null = null) => {
    setForm({ ...emptyForm, parentId });
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (cat: CategoryTreeNode) => {
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
    if (window.confirm(`Delete category "${name}"? Children will become top-level.`)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
          <Button className="rounded-full" onClick={() => startCreate(null)}>
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">None (Top-level)</option>
                {flatCategories
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
      ) : treeCategories.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <CategoryTree
            nodes={treeCategories}
            depth={0}
            collapsed={collapsed}
            onToggle={toggleCollapse}
            onEdit={startEdit}
            onDelete={handleDelete}
            onAddChild={(parentId) => startCreate(parentId)}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}

function CategoryTree({
  nodes,
  depth,
  collapsed,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  isDeleting,
}: {
  nodes: CategoryTreeNode[];
  depth: number;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (cat: CategoryTreeNode) => void;
  onDelete: (id: string, name: string) => void;
  onAddChild: (parentId: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div>
      {nodes.map((node, index) => {
        const hasChildren = node.children && node.children.length > 0;
        const isCollapsed = collapsed.has(node.id);
        const isLast = index === nodes.length - 1;

        return (
          <div key={node.id}>
            <div
              className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                !isLast || (hasChildren && !isCollapsed) ? "border-b" : ""
              }`}
              style={{ paddingLeft: `${depth * 28 + 16}px` }}
            >
              {/* Tree connector + expand/collapse */}
              {depth > 0 && (
                <div className="w-4 h-px bg-gray-300 flex-shrink-0 -ml-2" />
              )}

              <button
                type="button"
                className={`flex-shrink-0 p-0.5 rounded transition-colors ${
                  hasChildren
                    ? "hover:bg-gray-200 cursor-pointer"
                    : "cursor-default"
                }`}
                onClick={() => hasChildren && onToggle(node.id)}
              >
                {hasChildren ? (
                  isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )
                ) : (
                  <span className="inline-block w-4" />
                )}
              </button>

              {/* Folder icon */}
              {hasChildren && !isCollapsed ? (
                <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}

              {/* Category info */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{node.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  /{node.slug}
                </span>
                {node.description && (
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                    — {node.description}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Add child category"
                  onClick={() => onAddChild(node.id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Edit category"
                  onClick={() => onEdit(node)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  title="Delete category"
                  disabled={isDeleting}
                  onClick={() => onDelete(node.id, node.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Children */}
            {hasChildren && !isCollapsed && (
              <CategoryTree
                nodes={node.children!}
                depth={depth + 1}
                collapsed={collapsed}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                isDeleting={isDeleting}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
