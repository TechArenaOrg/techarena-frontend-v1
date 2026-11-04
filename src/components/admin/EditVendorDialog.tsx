'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { vendorAPI } from '@/services/api/vendor-api';
import { ApiError } from '@/services/api/client';
import type { BusinessType, Vendor } from '@/types';

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
];

interface EditVendorDialogProps {
  vendor: Pick<Vendor, 'id' | 'businessName' | 'businessType' | 'businessRegistrationNumber' | 'taxNumber' | 'description' | 'websiteUrl'>;
}

// super_admin only - the backend 403s this for a plain admin, so the caller (the
// vendors page) only renders this for a super_admin actor in the first place.
export function EditVendorDialog({ vendor }: EditVendorDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState(vendor.businessName ?? '');
  const [businessType, setBusinessType] = useState<BusinessType | ''>(vendor.businessType ?? '');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState(vendor.businessRegistrationNumber ?? '');
  const [taxNumber, setTaxNumber] = useState(vendor.taxNumber ?? '');
  const [description, setDescription] = useState(vendor.description ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(vendor.websiteUrl ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await vendorAPI.updateVendor(vendor.id, {
        businessName: businessName.trim() || undefined,
        businessType: businessType || undefined,
        businessRegistrationNumber: businessRegistrationNumber.trim() || undefined,
        taxNumber: taxNumber.trim() || undefined,
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      });
      toast({ title: 'Vendor updated' });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <SimpleModal open={open} onClose={() => setOpen(false)} title="Edit Vendor">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="editBusinessName">Business Name</Label>
            <Input
              id="editBusinessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editBusinessType">Business Type</Label>
            <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
              <SelectTrigger id="editBusinessType">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editBusinessRegistrationNumber">Business Registration Number</Label>
              <Input
                id="editBusinessRegistrationNumber"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTaxNumber">Tax Number</Label>
              <Input
                id="editTaxNumber"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editWebsiteUrl">Website</Label>
            <Input
              id="editWebsiteUrl"
              type="url"
              placeholder="https://"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDescription">Description</Label>
            <Textarea
              id="editDescription"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
