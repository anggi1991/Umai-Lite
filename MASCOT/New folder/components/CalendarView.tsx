import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Smile, Meh, Frown, X } from 'lucide-react';

interface JournalEntry {
  id: number;
  date: Date;
  title: string;
  mood: string;
  activities: string[];
  notes: string;
}

interface CalendarViewProps {
  open: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onAddEntry?: () => void;
}

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case 'happy':
    case 'excited':
      return <Smile className="w-4 h-4 text-green-500" />;
    case 'tired':
      return <Meh className="w-4 h-4 text-orange-500" />;
    case 'sad':
      return <Frown className="w-4 h-4 text-red-500" />;
    default:
      return <Smile className="w-4 h-4 text-green-500" />;
  }
};

export function CalendarView({ open, onClose, entries, onAddEntry }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get entries for selected date
  const getEntriesForDate = (date: Date | undefined) => {
    if (!date) return [];
    return entries.filter((entry) => {
      return (
        entry.date.getDate() === date.getDate() &&
        entry.date.getMonth() === date.getMonth() &&
        entry.date.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get dates that have entries
  const getDatesWithEntries = () => {
    return entries.map((entry) => entry.date);
  };

  const selectedEntries = getEntriesForDate(selectedDate);
  const datesWithEntries = getDatesWithEntries();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Journal Calendar</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-xl border border-border"
              modifiers={{
                hasEntry: datesWithEntries,
              }}
              modifiersStyles={{
                hasEntry: {
                  fontWeight: 'bold',
                  position: 'relative',
                },
              }}
              modifiersClassNames={{
                hasEntry: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#AEE1F9]',
              }}
            />
          </div>

          {/* Entries for selected date */}
          {selectedDate && (
            <div>
              <h3 className="mb-3 text-foreground">
                Entries for {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>

              {selectedEntries.length > 0 ? (
                <div className="space-y-3">
                  {selectedEntries.map((entry) => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-1">{getMoodIcon(entry.mood)}</div>
                        <div className="flex-1">
                          <h4 className="text-foreground mb-1">{entry.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {entry.notes}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.activities.map((activity) => (
                              <Badge key={activity} variant="secondary" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No entries for this date
                  </p>
                  <button 
                    onClick={() => {
                      onClose();
                      onAddEntry?.();
                    }}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] rounded-full text-sm text-[#2C3E50] hover:shadow-md transition-shadow"
                  >
                    Add Entry
                  </button>
                </Card>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-[#AEE1F9]"></div>
              <span>Days with entries</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
