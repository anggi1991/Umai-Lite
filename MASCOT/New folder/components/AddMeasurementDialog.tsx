import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X } from 'lucide-react';

interface AddMeasurementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (measurement: any) => void;
}

export function AddMeasurementDialog({ open, onClose, onSave }: AddMeasurementDialogProps) {
  const [activeTab, setActiveTab] = useState('weight');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');

  const handleSave = () => {
    const measurement = {
      type: activeTab,
      value: activeTab === 'weight' ? weight : activeTab === 'height' ? height : sleepHours,
      date: new Date(),
    };

    if (onSave) {
      onSave(measurement);
    }

    // Reset form
    setWeight('');
    setHeight('');
    setSleepHours('');
    setActiveTab('weight');
    onClose();
  };

  const isValid = () => {
    if (activeTab === 'weight') return weight && parseFloat(weight) > 0;
    if (activeTab === 'height') return height && parseFloat(height) > 0;
    if (activeTab === 'sleep') return sleepHours && parseFloat(sleepHours) > 0;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Measurement</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="height">Height</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 6.4"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your baby's current weight in kilograms
              </p>
            </div>
          </TabsContent>

          <TabsContent value="height" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g., 65"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your baby's current height in centimeters
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sleep" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Duration (hours)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                placeholder="e.g., 14"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter total sleep hours for the day
              </p>
            </div>
          </TabsContent>

          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid()}
              className="flex-1 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] hover:shadow-md border-none disabled:opacity-50"
            >
              Save Measurement
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
