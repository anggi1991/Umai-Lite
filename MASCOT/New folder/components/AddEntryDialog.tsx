import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Smile, Meh, Frown } from 'lucide-react';

interface AddEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (entry: any) => void;
}

const moods = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'tired', label: 'Tired', icon: Meh, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'bg-red-100 text-red-700 border-red-300' },
];

const activityOptions = [
  'Feeding', 'Sleep', 'Tummy Time', 'Bath', 'Play', 'Health', 
  'Milestone', 'Vaccination', 'Learning', 'Diaper'
];

export function AddEntryDialog({ open, onClose, onSave }: AddEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSave = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date(),
      displayDate: 'Just now',
      title: title || 'Untitled entry',
      mood: selectedMood,
      activities: selectedActivities,
      notes: notes,
    };

    if (onSave) {
      onSave(newEntry);
    }

    // Reset form
    setTitle('');
    setNotes('');
    setSelectedMood('happy');
    setSelectedActivities([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Journal Entry</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Morning routine went smoothly"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <Label>How are you feeling?</Label>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.id
                        ? mood.color + ' border-2'
                        : 'bg-white border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs">{mood.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-3">
            <Label>Activities</Label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivityToggle(activity)}
                  className="transition-all"
                >
                  <Badge
                    variant={selectedActivities.includes(activity) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      selectedActivities.includes(activity)
                        ? 'bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] border-none'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {activity}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Share your parenting moment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] hover:shadow-md border-none"
            >
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
