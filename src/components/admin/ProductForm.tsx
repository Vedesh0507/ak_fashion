import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, X, Info } from 'lucide-react';
import CategorySelector from './CategorySelector';

type Product = Tables<'products'>;

interface ProductFormProps {
  product?: Product | null;
  categories: { id: string; name: string }[];
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>, sizes: SizeStock[], colors: ColorData[], images: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onCategoryAdded: () => void;
}

interface SizeStock {
  size: string;
  stock: number;
}

interface ColorData {
  name: string;
  hexCode: string;
}

const PRESET_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const PRESET_COLORS: ColorData[] = [
  { name: 'Black', hexCode: '#000000' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Red', hexCode: '#EF4444' },
  { name: 'Blue', hexCode: '#3B82F6' },
  { name: 'Green', hexCode: '#22C55E' },
  { name: 'Yellow', hexCode: '#EAB308' },
  { name: 'Orange', hexCode: '#F97316' },
  { name: 'Purple', hexCode: '#A855F7' },
  { name: 'Pink', hexCode: '#EC4899' },
  { name: 'Gray', hexCode: '#6B7280' },
  { name: 'Brown', hexCode: '#92400E' },
  { name: 'Navy', hexCode: '#1E3A5F' },
  { name: 'Maroon', hexCode: '#7F1D1D' },
  { name: 'Beige', hexCode: '#D4C4A8' },
];

const ProductForm = ({ product, categories, onSubmit, onCancel, isLoading, onCategoryAdded }: ProductFormProps) => {
  const [showCategorySelector, setShowCategorySelector] = useState(!product);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    productCode: '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    original_price: product?.original_price?.toString() || '',
    category: product?.category || '',
    image_url: product?.image_url || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors] = useState<ColorData[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Load existing product data
  useEffect(() => {
    if (product) {
      loadProductDetails();
    }
  }, [product]);

  const loadProductDetails = async () => {
    if (!product) return;

    // Load sizes
    const { data: sizes } = await supabase
      .from('product_sizes')
      .select('*')
      .eq('product_id', product.id);

    if (sizes) {
      setSelectedSizes(sizes.map(s => s.size));
      const stocks: Record<string, number> = {};
      sizes.forEach(s => { stocks[s.size] = s.stock_quantity; });
      setSizeStocks(stocks);
    }

    // Load colors
    const { data: colors } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', product.id);

    if (colors) {
      setSelectedColors(colors.map(c => ({ name: c.name, hexCode: c.hex_code })));
    }

    // Load images
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');

    if (images) {
      setAdditionalImages(images.map(i => i.image_url));
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setShowCategorySelector(false);
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
      const newStocks = { ...sizeStocks };
      delete newStocks[size];
      setSizeStocks(newStocks);
    } else {
      setSelectedSizes([...selectedSizes, size]);
      setSizeStocks({ ...sizeStocks, [size]: 0 });
    }
  };

  const addCustomSize = () => {
    if (customSize && !selectedSizes.includes(customSize.toUpperCase())) {
      const size = customSize.toUpperCase();
      setSelectedSizes([...selectedSizes, size]);
      setSizeStocks({ ...sizeStocks, [size]: 0 });
      setCustomSize('');
    }
  };

  const toggleColor = (color: ColorData) => {
    if (selectedColors.find(c => c.name === color.name)) {
      setSelectedColors(selectedColors.filter(c => c.name !== color.name));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const addImage = () => {
    if (newImageUrl && !additionalImages.includes(newImageUrl)) {
      setAdditionalImages([...additionalImages, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setAdditionalImages(additionalImages.filter(i => i !== url));
  };

  const getTotalStock = () => {
    return Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sizes: SizeStock[] = selectedSizes.map(size => ({
      size,
      stock: sizeStocks[size] || 0,
    }));

    onSubmit(
      {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        image_url: formData.image_url || null,
        stock_quantity: getTotalStock(),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      },
      sizes,
      selectedColors,
      additionalImages
    );
  };

  if (showCategorySelector) {
    return (
      <CategorySelector
        categories={categories}
        onSelect={handleCategorySelect}
        onCancel={onCancel}
        onCategoryAdded={onCategoryAdded}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {formData.category}
        </Badge>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => setShowCategorySelector(true)}
        >
          Change
        </Button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="productCode">Product Code</Label>
          <Input
            id="productCode"
            value={formData.productCode}
            onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
            placeholder="SKU-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="original_price">Original Price (₹)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            placeholder="Strike-through price"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Available Sizes *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSizeChart(true)}
            className="text-primary"
          >
            <Info className="h-4 w-4 mr-1" />
            Size Chart Guide
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-md border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Custom size"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            className="max-w-[150px]"
          />
          <Button type="button" variant="outline" onClick={addCustomSize} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Size
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <Label>Available Colors</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                selectedColors.find(c => c.name === color.name)
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color.hexCode }}
              />
              <span className="text-sm">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Quantity by Size */}
      {selectedSizes.length > 0 && (
        <div className="space-y-3">
          <Label>Stock Quantity by Size</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedSizes.map((size) => (
              <div key={size} className="flex items-center gap-2">
                <span className="text-sm font-medium w-10">{size}:</span>
                <Input
                  type="number"
                  min="0"
                  value={sizeStocks[size] || 0}
                  onChange={(e) => setSizeStocks({ ...sizeStocks, [size]: parseInt(e.target.value) || 0 })}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Total: <strong>{getTotalStock()}</strong> pieces
          </p>
        </div>
      )}

      {/* Main Image */}
      <div className="space-y-2">
        <Label htmlFor="image_url">Main Product Image</Label>
        <div className="flex gap-2">
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
        </div>
        {formData.image_url && (
          <div className="w-24 h-24 rounded-md border overflow-hidden">
            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Additional Images */}
      <div className="space-y-3">
        <Label>Additional Images (Gallery)</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste image URL"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        {additionalImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {additionalImages.map((url, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md border overflow-hidden group">
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {additionalImages.length} additional images added
        </p>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
          <Label htmlFor="is_featured">Featured Product</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>

      {/* Size Chart Dialog */}
      <Dialog open={showSizeChart} onOpenChange={setShowSizeChart}>
        <DialogContent>
          <h3 className="text-lg font-semibold mb-4">Size Chart Guide</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left">Size</th>
                  <th className="py-2 px-3 text-left">Chest (in)</th>
                  <th className="py-2 px-3 text-left">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2 px-3">S</td><td className="py-2 px-3">34-36</td><td className="py-2 px-3">36-38</td></tr>
                <tr className="border-b"><td className="py-2 px-3">M</td><td className="py-2 px-3">38-40</td><td className="py-2 px-3">40-42</td></tr>
                <tr className="border-b"><td className="py-2 px-3">L</td><td className="py-2 px-3">42-44</td><td className="py-2 px-3">44-46</td></tr>
                <tr className="border-b"><td className="py-2 px-3">XL</td><td className="py-2 px-3">46-48</td><td className="py-2 px-3">48-50</td></tr>
                <tr className="border-b"><td className="py-2 px-3">2XL</td><td className="py-2 px-3">50-52</td><td className="py-2 px-3">52-54</td></tr>
                <tr><td className="py-2 px-3">3XL</td><td className="py-2 px-3">54-56</td><td className="py-2 px-3">56-58</td></tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default ProductForm;
