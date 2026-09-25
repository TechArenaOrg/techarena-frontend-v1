'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { addressesAPI } from '@/services/api/addresses-api';
import { ApiError } from '@/services/api/client';
import type { Address, AddressFormData, AddressType } from '@/types';

interface AddressFormProps {
  address?: Address;
  onSuccess: (address: Address) => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditing = !!address;

  const [type, setType] = useState<AddressType>(address?.type ?? 'shipping');
  const [streetAddress, setStreetAddress] = useState(address?.streetAddress ?? '');
  const [apartment, setApartment] = useState(address?.apartment ?? '');
  const [city, setCity] = useState(address?.city ?? '');
  const [stateProvince, setStateProvince] = useState(address?.stateProvince ?? '');
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? '');
  const [country, setCountry] = useState(address?.country ?? 'UG');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: AddressFormData = {
      type,
      streetAddress: streetAddress.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim(),
      isDefault,
    };

    setIsSubmitting(true);
    try {
      const saved = isEditing
        ? await addressesAPI.updateAddress(address.id, input)
        : await addressesAPI.createAddress(input);
      onSuccess(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Address Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as AddressType)} disabled={isSubmitting}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address</Label>
          <Input
            id="streetAddress"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
          <Input id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} disabled={isSubmitting} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stateProvince">State / Province (optional)</Label>
            <Input id="stateProvince" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code (optional)</Label>
            <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required disabled={isSubmitting} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="isDefault" checked={isDefault} onCheckedChange={(v) => setIsDefault(v === true)} disabled={isSubmitting} />
          <Label htmlFor="isDefault" className="font-normal cursor-pointer">
            Set as default {type} address
          </Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Address'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
