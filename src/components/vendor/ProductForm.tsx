'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { productsAPI, ProductInput } from '@/services/api/products-api';
import { uploadAPI } from '@/services/api/upload-api';
import { ApiError } from '@/services/api/client';
import { generateSlug } from '@/lib/utils';
import type { Category, Product, ProductStatus } from '@/types';

interface FormImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [sku, setSku] = useState(product?.sku ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [comparePrice, setComparePrice] = useState(product?.comparePrice ? String(product.comparePrice) : '');
  const [stockQuantity, setStockQuantity] = useState(product ? String(product.stockQuantity) : '0');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product ? String(product.lowStockThreshold) : '5'
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft');
  const [images, setImages] = useState<FormImage[]>(
    (product?.images ?? []).map((img) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      const url = await uploadAPI.uploadImage(file, 'products');
      setImages((prev) => [...prev, { url, altText: name, isPrimary: prev.length === 0 }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      setError(
        'Slug is required - it could not be generated from the product name (try adding some letters or numbers), or enter one manually.'
      );
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    const input: ProductInput = {
      name,
      slug: trimmedSlug,
      sku,
      categoryId,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      stockQuantity: parseInt(stockQuantity, 10),
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : undefined,
      status,
      images: images.map((img, index) => ({ ...img, sortOrder: index })),
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await productsAPI.updateProduct(product.id, input);
        toast({ title: 'Product updated' });
      } else {
        await productsAPI.createProduct(input);
        toast({ title: 'Product created' });
      }
      router.push('/vendor/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Auto-generated from the name - edit if needed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                disabled={isSubmitting || isEditing}
              />
              {isEditing && <p className="text-xs text-muted-foreground">SKU can't be changed after creation.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Compare Price</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <p className="text-xs text-muted-foreground">
              The first image (or the one you mark) is used as the primary photo across the store.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              {images.map((image, index) => (
                <div
                  key={image.url}
                  className="relative w-28 h-28 rounded-xl overflow-hidden border shadow-sm group ring-1 ring-black/5"
                >
                  <Image src={image.url} alt={image.altText || name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {image.isPrimary && (
                    <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow">
                      <Icons.star className="h-2.5 w-2.5 fill-current" />
                      Primary
                    </span>
                  )}
                  <div className="absolute top-1.5 inset-x-1.5 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    {!image.isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-gray-700 shadow hover:bg-white hover:scale-105 transition-all"
                        title="Set as primary"
                      >
                        <Icons.star className="h-3 w-3" />
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-destructive shadow hover:bg-white hover:scale-105 transition-all"
                      title="Remove image"
                    >
                      <Icons.x className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
                className="group w-28 h-28 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50 disabled:pointer-events-none"
              >
                {isUploading ? (
                  <>
                    <Icons.spinner className="h-5 w-5 animate-spin" />
                    <span className="text-xs font-medium">Uploading...</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center justify-center h-9 w-9 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform group-hover:scale-110 group-hover:ring-primary/30">
                      <Icons.imagePlus className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium">Add image</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelected}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)} disabled={isSubmitting}>
              <SelectTrigger id="status" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/vendor/products')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
