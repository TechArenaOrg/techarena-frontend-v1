'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  categoryId?: string;
}

export function ProductFilters({ categoryId }: ProductFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            {['Laptops', 'Smartphones', 'Tablets', 'Gaming', 'Accessories'].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox id={`category-${category}`} />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Price Range</h3>
          <div className="space-y-2">
            {[
              'Under UGX 500,000',
              'UGX 500,000 - 1,000,000',
              'UGX 1,000,000 - 2,000,000',
              'Over UGX 2,000,000'
            ].map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox id={`price-${range}`} />
                <Label htmlFor={`price-${range}`} className="text-sm">
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Brand */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Brand</h3>
          <div className="space-y-2">
            {['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo'].map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand}`} />
                <Label htmlFor={`brand-${brand}`} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <Button variant="outline" className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}