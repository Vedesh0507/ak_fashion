import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingCart, LogOut, Plus, Home } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import ProductsTable from '@/components/admin/ProductsTable';
import OrdersTable from '@/components/admin/OrdersTable';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Order = Tables<'orders'>;

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchCategories();
    }
  }, [user, isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProduct.id);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Product Deleted',
        description: 'Product has been removed successfully.',
      });
      fetchProducts();
    }
    setDeleteProduct(null);
  };

  interface SizeStock {
    size: string;
    stock: number;
  }

  interface ColorData {
    name: string;
    hexCode: string;
  }

  const handleSubmitProduct = async (
    data: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    sizes: SizeStock[],
    colors: ColorData[],
    images: string[]
  ) => {
    setIsSubmitting(true);
    
    let productId = selectedProduct?.id;

    if (selectedProduct) {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', selectedProduct.id);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update product',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single();
      
      if (error || !newProduct) {
        toast({
          title: 'Error',
          description: 'Failed to add product',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      productId = newProduct.id;
    }

    // Save sizes
    if (productId) {
      await supabase.from('product_sizes').delete().eq('product_id', productId);
      if (sizes.length > 0) {
        await supabase.from('product_sizes').insert(
          sizes.map(s => ({
            product_id: productId,
            size: s.size,
            stock_quantity: s.stock,
          }))
        );
      }

      // Save colors
      await supabase.from('product_colors').delete().eq('product_id', productId);
      if (colors.length > 0) {
        await supabase.from('product_colors').insert(
          colors.map(c => ({
            product_id: productId,
            name: c.name,
            hex_code: c.hexCode,
          }))
        );
      }

      // Save additional images
      await supabase.from('product_images').delete().eq('product_id', productId);
      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((url, index) => ({
            product_id: productId,
            image_url: url,
            sort_order: index,
          }))
        );
      }
    }

    toast({
      title: selectedProduct ? 'Product Updated' : 'Product Added',
      description: selectedProduct 
        ? 'Product has been updated successfully.'
        : 'New product has been added successfully.',
    });
    setIsProductDialogOpen(false);
    fetchProducts();
    setIsSubmitting(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${status}`,
      });
      fetchOrders();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have admin privileges. Contact the administrator to get access.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-serif font-semibold text-primary">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              View Store
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Products</h2>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <ProductsTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={setDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-lg font-semibold">Manage Orders</h2>
            <OrdersTable
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={categories}
            onSubmit={handleSubmitProduct}
            onCancel={() => setIsProductDialogOpen(false)}
            isLoading={isSubmitting}
            onCategoryAdded={fetchCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
