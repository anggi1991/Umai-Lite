import { useState } from 'react';
import { AppBar } from './AppBar';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CalendarView } from './CalendarView';
import { AddEntryDialog } from './AddEntryDialog';
import { Calendar, Clock, Smile, Meh, Frown } from 'lucide-react';
import { toast } from 'sonner';

interface JournalScreenProps {
  onBack: () => void;
  onFABClick?: () => void;
}

// Helper to create dates relative to today
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const journalEntries = [
  {
    id: 1,
    date: today,
    displayDate: 'Today, 10:30 AM',
    title: 'Morning routine went smoothly',
    mood: 'happy',
    activities: ['Feeding', 'Tummy Time', 'Bath'],
    notes: 'Baby slept through the night! Started the day with a good feeding session.',
  },
  {
    id: 2,
    date: yesterday,
    displayDate: 'Yesterday, 3:45 PM',
    title: 'First time trying solid foods',
    mood: 'excited',
    activities: ['Feeding', 'Milestone'],
    notes: 'Introduced mashed bananas. Baby loved it! Made funny faces but ate well.',
  },
  {
    id: 3,
    date: twoDaysAgo,
    displayDate: '2 days ago',
    title: 'Difficult night',
    mood: 'tired',
    activities: ['Sleep', 'Feeding'],
    notes: 'Baby woke up every 2 hours. Need to adjust bedtime routine.',
  },
  {
    id: 4,
    date: threeDaysAgo,
    displayDate: '3 days ago',
    title: 'Pediatrician visit',
    mood: 'happy',
    activities: ['Health', 'Vaccination'],
    notes: 'Got 6-month vaccines. Weight: 6.2 kg, Height: 64 cm. Doctor said everything looks great!',
  },
  {
    id: 5,
    date: fiveDaysAgo,
    displayDate: '5 days ago',
    title: 'Playtime adventures',
    mood: 'happy',
    activities: ['Play', 'Learning'],
    notes: 'Baby is starting to recognize favorite toys and reaching for them!',
  },
  {
    id: 6,
    date: sevenDaysAgo,
    displayDate: '7 days ago',
    title: 'Weekly checkup',
    mood: 'happy',
    activities: ['Health'],
    notes: 'Growing well and hitting all the milestones. Proud parent moment!',
  },
];

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case 'happy':
    case 'excited':
      return <Smile className="w-5 h-5 text-green-500" />;
    case 'tired':
      return <Meh className="w-5 h-5 text-orange-500" />;
    case 'sad':
      return <Frown className="w-5 h-5 text-red-500" />;
    default:
      return <Smile className="w-5 h-5 text-green-500" />;
  }
};

const getMoodColor = (mood: string) => {
  switch (mood) {
    case 'happy':
    case 'excited':
      return 'bg-green-100 text-green-700';
    case 'tired':
      return 'bg-orange-100 text-orange-700';
    case 'sad':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function JournalScreen({ onBack, onFABClick }: JournalScreenProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [entries, setEntries] = useState(journalEntries);

  const handleAddEntry = (newEntry: any) => {
    setEntries((prev) => [newEntry, ...prev]);
    toast.success('Journal entry added successfully!');
  };

  // Expose the add entry function to parent via callback
  if (onFABClick) {
    // This is a bit of a hack but works for simple cases
    (window as any).__openJournalAddEntry = () => setIsAddEntryOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <AppBar title="Parenting Journal" showBack onBack={onBack} actions={['search', 'menu']} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl text-foreground mb-1">24</div>
              <div className="text-xs text-muted-foreground">Total Entries</div>
            </div>
            <div>
              <div className="text-2xl text-foreground mb-1">7</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div>
              <div className="text-2xl text-foreground mb-1">180</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Quick Add */}
        <Card className="p-5 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] border-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#2C3E50] mb-1">Today's Entry</h3>
              <p className="text-sm text-[#2C3E50]/80">Record your parenting moments</p>
            </div>
            <button 
              onClick={() => setIsAddEntryOpen(true)}
              className="px-4 py-2 bg-white rounded-full text-sm text-[#2C3E50] hover:shadow-md transition-shadow"
            >
              Add Entry
            </button>
          </div>
        </Card>

        {/* Journal Entries */}
        <div>
          <h3 className="mb-4 text-foreground">Recent Entries</h3>
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getMoodColor(entry.mood)}`}>
                      {getMoodIcon(entry.mood)}
                    </div>
                    <div>
                      <h4 className="text-foreground">{entry.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.displayDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{entry.notes}</p>

                <div className="flex flex-wrap gap-2">
                  {entry.activities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar View Prompt */}
        <Card className="p-5 border-2 border-dashed border-border bg-muted/50">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h4 className="text-foreground mb-1">View Calendar</h4>
            <p className="text-sm text-muted-foreground mb-3">
              See all your entries in a calendar view
            </p>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="px-4 py-2 bg-white rounded-full text-sm text-foreground border border-border hover:bg-muted transition-colors"
            >
              Open Calendar
            </button>
          </div>
        </Card>
      </div>

      {/* Calendar View Dialog */}
      <CalendarView 
        open={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        entries={entries}
        onAddEntry={() => setIsAddEntryOpen(true)}
      />

      {/* Add Entry Dialog */}
      <AddEntryDialog
        open={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        onSave={handleAddEntry}
      />
    </div>
  );
}
