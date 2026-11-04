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
import type { BusinessType } from '@/types';

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
];

interface CreateVendorRecordDialogProps {
  userId: string;
  userLabel: string;
}

// super_admin only - the backend 403s this for anyone else, so the caller (the
// users page) only renders this for a super_admin actor in the first place.
// Skips the public apply/approve flow - for setting a vendor account up on a
// user's behalf (e.g. right after promoting them to official_store_manager).
export function CreateVendorRecordDialog({ userId, userLabel }: CreateVendorRecordDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  const resetAndClose = () => {
    setOpen(false);
    setError(null);
    setBusinessName('');
    setBusinessType('');
    setBusinessRegistrationNumber('');
    setTaxNumber('');
    setDescription('');
    setWebsiteUrl('');
    setCommissionRate('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError('Business name is required.');
      return;
    }
    const rate = commissionRate.trim() ? parseFloat(commissionRate) : undefined;
    if (rate !== undefined && (Number.isNaN(rate) || rate < 0 || rate > 100)) {
      setError('Commission rate must be a number between 0 and 100.');
      return;
    }

    setIsSubmitting(true);
    try {
      await vendorAPI.createVendorDirect({
        userId,
        businessName: businessName.trim(),
        businessType: businessType || undefined,
        businessRegistrationNumber: businessRegistrationNumber.trim() || undefined,
        taxNumber: taxNumber.trim() || undefined,
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        commissionRate: rate,
      });
      toast({ title: 'Vendor record created' });
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
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Create Vendor Record
      </Button>
      <SimpleModal open={open} onClose={resetAndClose} title={`Create Vendor Record for ${userLabel}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="newVendorBusinessName">Business Name</Label>
            <Input
              id="newVendorBusinessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newVendorBusinessType">Business Type</Label>
            <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
              <SelectTrigger id="newVendorBusinessType">
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
              <Label htmlFor="newVendorBusinessRegistrationNumber">Business Registration Number</Label>
              <Input
                id="newVendorBusinessRegistrationNumber"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newVendorTaxNumber">Tax Number</Label>
              <Input
                id="newVendorTaxNumber"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newVendorWebsiteUrl">Website</Label>
            <Input
              id="newVendorWebsiteUrl"
              type="url"
              placeholder="https://"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newVendorCommissionRate">Commission Rate (%)</Label>
            <Input
              id="newVendorCommissionRate"
              type="number"
              min={0}
              max={100}
              step="0.1"
              placeholder="Defaults to 5%"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newVendorDescription">Description</Label>
            <Textarea
              id="newVendorDescription"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Vendor Record'}
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
