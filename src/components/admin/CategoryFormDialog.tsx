'use client';

import { FormEvent, ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { categoriesAPI } from '@/services/api/categories-api';
import { uploadAPI } from '@/services/api/upload-api';
import { ApiError } from '@/services/api/client';
import { generateSlug } from '@/lib/utils';
import type { Category, CategoryStatus } from '@/types';

interface CategoryFormDialogProps {
  trigger: ReactNode;
  // Every other category - used to populate the parent picker, and to exclude this
  // category plus its own descendants from that list when editing (a category can't
  // be made its own ancestor).
  allCategories: Category[];
  category?: Category;
  // Preselects the parent when opened from an "Add Subcategory" action.
  defaultParentId?: string | null;
}

function collectDescendantIds(categoryId: string, all: Category[]): Set<string> {
  const ids = new Set<string>();
  let frontier = [categoryId];
  while (frontier.length > 0) {
    const children = all.filter((c) => frontier.includes(c.parentId ?? ''));
    frontier = children.map((c) => c.id);
    frontier.forEach((id) => ids.add(id));
  }
  return ids;
}

export function CategoryFormDialog({ trigger, allCategories, category, defaultParentId }: CategoryFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!category;
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [parentId, setParentId] = useState<string>(category?.parentId ?? defaultParentId ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? '');
  const [isFeatured, setIsFeatured] = useState(category?.isFeatured ?? false);
  const [status, setStatus] = useState<CategoryStatus>(category?.status ?? 'active');
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [metaTitle, setMetaTitle] = useState(category?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(category?.metaDescription ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A category can't become its own parent, nor the parent of one of its own
  // descendants (that would create a cycle) - exclude both when editing.
  const excludedIds = category ? new Set([category.id, ...collectDescendantIds(category.id, allCategories)]) : new Set<string>();
  const parentOptions = allCategories.filter((c) => !excludedIds.has(c.id));

  const resetAndClose = () => {
    setOpen(false);
    setError(null);
    if (!isEditing) {
      setName('');
      setSlug('');
      setSlugTouched(false);
      setParentId(defaultParentId ?? '');
      setDescription('');
      setIcon('');
      setImageUrl('');
      setIsFeatured(false);
      setStatus('active');
      setSortOrder('0');
      setMetaTitle('');
      setMetaDescription('');
      setShowAdvanced(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadAPI.uploadImage(file, 'categories', setUploadProgress);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    const finalSlug = (slug.trim() ? generateSlug(slug) : generateSlug(name)).trim();
    if (!finalSlug) {
      setError('Slug is required.');
      return;
    }
    const sortOrderNum = sortOrder.trim() ? parseInt(sortOrder, 10) : 0;
    if (Number.isNaN(sortOrderNum)) {
      setError('Sort order must be a number.');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      // The backend rejects an explicit null here - omit the field entirely for
      // "no parent" rather than sending null.
      parentId: parentId || undefined,
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isFeatured,
      sortOrder: sortOrderNum,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      status,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await categoriesAPI.updateCategory(category.id, payload);
        toast({ title: 'Category updated' });
      } else {
        await categoriesAPI.createCategory(payload);
        toast({ title: 'Category created' });
      }
      resetAndClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <SimpleModal open={open} onClose={resetAndClose} title={isEditing ? 'Edit Category' : 'New Category'} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2 w-20">
              <Label htmlFor="categoryIcon">Icon</Label>
              <Input
                id="categoryIcon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📱"
                disabled={isSubmitting}
                className="text-center text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorySlug">Slug</Label>
            <Input
              id="categorySlug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Used in the URL - generated from the name, or set it yourself.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryParent">Parent Category</Label>
            <Select value={parentId || 'none'} onValueChange={(v) => setParentId(v === 'none' ? '' : v)} disabled={isSubmitting}>
              <SelectTrigger id="categoryParent">
                <SelectValue placeholder="No parent (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level)</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0">
                  <Image src={imageUrl} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-white/90 text-destructive shadow hover:bg-white"
                    title="Remove image"
                  >
                    <Icons.x className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSubmitting}
                  className="group w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      <span className="text-xs font-medium">{uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Icons.imagePlus className="h-5 w-5" />
                      <span className="text-xs font-medium">Add</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryStatus">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CategoryStatus)} disabled={isSubmitting}>
                <SelectTrigger id="categoryStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorySortOrder">Sort Order</Label>
              <Input
                id="categorySortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="categoryIsFeatured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="categoryIsFeatured" className="cursor-pointer">
              Featured (shown on the homepage)
            </Label>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Icons.chevronRight className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            SEO fields
          </button>
          {showAdvanced && (
            <div className="space-y-4 pl-5 border-l-2">
              <div className="space-y-2">
                <Label htmlFor="categoryMetaTitle">Meta Title</Label>
                <Input
                  id="categoryMetaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryMetaDescription">Meta Description</Label>
                <Textarea
                  id="categoryMetaDescription"
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
            </Button>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
