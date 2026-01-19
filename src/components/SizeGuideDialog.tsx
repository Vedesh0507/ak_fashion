import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ruler } from 'lucide-react';

const SizeGuideDialog = () => {
  const sizeData = [
    { size: 'M', bust: '36"', waist: '32"', hip: '38"' },
    { size: 'L', bust: '38"', waist: '34"', hip: '40"' },
    { size: 'XL', bust: '40"', waist: '36"', hip: '42"' },
    { size: '2XL', bust: '42"', waist: '38"', hip: '44"' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-primary p-0 h-auto">
          <Ruler className="h-4 w-4 mr-1" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Size Guide
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left py-3 px-4 font-semibold border-b">Size</th>
                  <th className="text-left py-3 px-4 font-semibold border-b">Bust</th>
                  <th className="text-left py-3 px-4 font-semibold border-b">Waist</th>
                  <th className="text-left py-3 px-4 font-semibold border-b">Hip</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row) => (
                  <tr key={row.size} className="border-b hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{row.size}</td>
                    <td className="py-3 px-4">{row.bust}</td>
                    <td className="py-3 px-4">{row.waist}</td>
                    <td className="py-3 px-4">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold text-sm">How to Measure</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><strong>Bust:</strong> Measure around the fullest part of your chest</li>
              <li><strong>Waist:</strong> Measure around your natural waistline</li>
              <li><strong>Hip:</strong> Measure around the fullest part of your hips</li>
            </ul>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            For sarees, the blouse size typically follows these measurements. 
            Contact us for custom sizing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuideDialog;
