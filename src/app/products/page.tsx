import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/blocks/product-card';
import { ProductCardSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our wide selection of technology products in Uganda.',
};

async function ProductGrid({ searchParams }: { searchParams: any }) {
  // Mock data - replace with actual API calls based on searchParams
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const products = Array.from({ length: 12 }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    slug: `product-${i + 1}`,
    price: Math.floor(Math.random() * 1000000) + 100000,
    comparePrice: Math.floor(Math.random() * 1200000) + 200000,
    image: `/api/placeholder/300/300?text=Product${i + 1}`,
    vendor: {
      name: `Vendor ${Math.floor(Math.random() * 5) + 1}`,
      slug: `vendor-${Math.floor(Math.random() * 5) + 1}`,
    },
    rating: Math.random() * 2 + 3,
    reviewCount: Math.floor(Math.random() * 100) + 10,
    category: {
      name: ['Laptops', 'Phones', 'Accessories', 'Gaming'][Math.floor(Math.random() * 4)],
    },
    inStock: Math.random() > 0.2,
    isOnSale: Math.random() > 0.7,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product as any} />
      ))}
    </div>
  );
}

function ProductFilters() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {['Laptops', 'Smartphones', 'Tablets', 'Gaming', 'Accessories'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={category} />
                  <Label htmlFor={category}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Price Range</h3>
            <div className="px-3">
              <Slider
                defaultValue={[100000, 2000000]}
                max={5000000}
                min={0}
                step={50000}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>UGX 100,000</span>
                <span>UGX 2,000,000</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Brand</h3>
            <div className="space-y-2">
              {['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo'].map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox id={brand} />
                  <Label htmlFor={brand}>{brand}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 text-gray-300" />
                    ))}
                    <span className="ml-1">& Up</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Icons.x className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: any }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <Suspense fallback={<PageHeaderSkeleton />}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                  Discover the best technology products in Uganda
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProductFilters />
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">24 Products</Badge>
                  <span className="text-sm text-muted-foreground">showing results for all products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <Icons.grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Icons.list className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Suspense 
                fallback={
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <ProductGrid searchParams={searchParams} />
              </Suspense>

              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" disabled>
                    <Icons.chevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">
                    Next
                    <Icons.chevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}