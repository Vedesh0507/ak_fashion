import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Folder, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategorySelectorProps {
  categories: { id: string; name: string }[];
  onSelect: (category: string) => void;
  onCancel: () => void;
  onCategoryAdded: () => void;
}

const CategorySelector = ({ categories, onSelect, onCancel, onCategoryAdded }: CategorySelectorProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsLoading(true);
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName.trim(), is_active: true }]);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Category Added',
        description: `"${newCategoryName}" has been added successfully.`,
      });
      onCategoryAdded();
      onSelect(newCategoryName.trim());
    }
    setIsLoading(false);
  };

  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string, categoryName: string) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Category Removed',
        description: `"${categoryName}" has been removed.`,
      });
      onCategoryAdded();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Select Category</h3>
        <p className="text-sm text-muted-foreground">Choose a category for the new product</p>
      </div>

      {isAddingNew ? (
        <div className="space-y-3">
          <Input
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} disabled={isLoading || !newCategoryName.trim()} className="flex-1">
              {isLoading ? 'Adding...' : 'Add Category'}
            </Button>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <FolderPlus className="h-5 w-5 text-primary" />
            <span className="font-medium">Add New Category</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.name)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-primary" />
                <span>{category.name}</span>
              </div>
              <X 
                className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                onClick={(e) => handleDeleteCategory(e, category.id, category.name)}
              />
            </button>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={onCancel} className="w-full">
        Cancel
      </Button>
    </div>
  );
};

export default CategorySelector;
