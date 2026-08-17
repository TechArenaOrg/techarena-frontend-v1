'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { purchaseOrderAPI, PurchaseOrderItemInput } from '@/services/api/purchase-order-api';
import { ApiError } from '@/services/api/client';
import type { Vendor } from '@/types';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

interface PurchaseOrderFormProps {
  returnPath: string;
  products: ProductOption[];
  // Only passed for the admin flow - lets a PO be assigned to a specific vendor,
  // or left unassigned for a platform-level purchase order.
  vendors?: Vendor[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyRow(): PurchaseOrderItemInput {
  return { productId: '', quantity: 1, unitCost: 0 };
}

export function PurchaseOrderForm({ returnPath, products, vendors }: PurchaseOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [vendorId, setVendorId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [orderDate, setOrderDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<PurchaseOrderItemInput[]>([emptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (index: number, patch: Partial<PurchaseOrderItemInput>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplierName.trim()) {
      setError('Please enter a supplier name.');
      return;
    }
    if (rows.some((row) => !row.productId)) {
      setError('Please select a product for every line item.');
      return;
    }

    setIsSubmitting(true);
    try {
      await purchaseOrderAPI.createPurchaseOrder({
        vendorId: vendors ? vendorId || null : undefined,
        supplierName: supplierName.trim(),
        orderDate,
        notes: notes || undefined,
        items: rows.map((row) => ({
          productId: row.productId,
          quantity: Number(row.quantity),
          unitCost: Number(row.unitCost),
        })),
      });
      toast({ title: 'Purchase order created' });
      router.push(returnPath);
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
        <CardTitle>New Purchase Order</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {vendors && (
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor (leave blank for a platform-level order)</Label>
              <Select value={vendorId} onValueChange={setVendorId} disabled={isSubmitting}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Platform-level (no vendor)" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Acme Electronics Ltd"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Product</Label>}
                    <Select value={row.productId} onValueChange={(value) => updateRow(index, { productId: value })} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1.5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Quantity</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="w-36 space-y-1.5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Unit Cost (UGX)</Label>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitCost}
                      onChange={(e) => updateRow(index, { unitCost: Number(e.target.value) })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={isSubmitting || rows.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icons.trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, emptyRow()])} disabled={isSubmitting}>
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create Purchase Order'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(returnPath)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
