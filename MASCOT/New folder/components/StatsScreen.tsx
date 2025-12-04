import { useState } from 'react';
import { AppBar } from './AppBar';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AddMeasurementDialog } from './AddMeasurementDialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface StatsScreenProps {
  onBack: () => void;
  onFABClick?: () => void;
}

const weightData = [
  { month: 'Jan', weight: 3.2 },
  { month: 'Feb', weight: 3.8 },
  { month: 'Mar', weight: 4.5 },
  { month: 'Apr', weight: 5.2 },
  { month: 'May', weight: 5.8 },
  { month: 'Jun', weight: 6.4 },
];

const heightData = [
  { month: 'Jan', height: 50 },
  { month: 'Feb', height: 53 },
  { month: 'Mar', height: 56 },
  { month: 'Apr', height: 59 },
  { month: 'May', height: 62 },
  { month: 'Jun', height: 65 },
];

const sleepData = [
  { day: 'Mon', hours: 14 },
  { day: 'Tue', hours: 13.5 },
  { day: 'Wed', hours: 14.5 },
  { day: 'Thu', hours: 13 },
  { day: 'Fri', hours: 14 },
  { day: 'Sat', hours: 15 },
  { day: 'Sun', hours: 14.5 },
];

export function StatsScreen({ onBack, onFABClick }: StatsScreenProps) {
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);

  const handleAddMeasurement = (measurement: any) => {
    toast.success(`${measurement.type.charAt(0).toUpperCase() + measurement.type.slice(1)} measurement added successfully!`);
  };

  // Expose the add measurement function to parent via callback
  if (onFABClick) {
    (window as any).__openStatsAddMeasurement = () => setIsAddMeasurementOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <AppBar title="Growth Tracker" showBack onBack={onBack} actions={['menu']} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#AEE1F9] to-[#87CEEB] border-none">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs text-[#2C3E50]/80">Current Weight</div>
              <TrendingUp className="w-4 h-4 text-[#2C3E50]" />
            </div>
            <div className="text-2xl text-[#2C3E50] mb-1">6.4 kg</div>
            <div className="text-xs text-[#2C3E50]/70">+0.6 kg this month</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#FADADD] to-[#FFB6C1] border-none">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs text-[#2C3E50]/80">Current Height</div>
              <TrendingUp className="w-4 h-4 text-[#2C3E50]" />
            </div>
            <div className="text-2xl text-[#2C3E50] mb-1">65 cm</div>
            <div className="text-xs text-[#2C3E50]/70">+3 cm this month</div>
          </Card>
        </div>

        {/* Tabs for different metrics */}
        <Card className="p-6">
          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="height">Height</TabsTrigger>
              <TabsTrigger value="sleep">Sleep</TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">Weight Progress</h3>
                <button className="text-sm text-[#AEE1F9] flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last 6 months
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#7F8C8D" />
                    <YAxis stroke="#7F8C8D" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#AEE1F9"
                      strokeWidth={3}
                      dot={{ fill: '#AEE1F9', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Weight in kilograms (kg)
              </div>
            </TabsContent>

            <TabsContent value="height" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">Height Progress</h3>
                <button className="text-sm text-[#AEE1F9] flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last 6 months
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#7F8C8D" />
                    <YAxis stroke="#7F8C8D" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="height"
                      stroke="#FADADD"
                      strokeWidth={3}
                      dot={{ fill: '#FADADD', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Height in centimeters (cm)
              </div>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">Sleep Patterns</h3>
                <button className="text-sm text-[#AEE1F9] flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  This week
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#7F8C8D" />
                    <YAxis stroke="#7F8C8D" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#E0BBE4"
                      strokeWidth={3}
                      dot={{ fill: '#E0BBE4', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Sleep hours per day
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Recent Entries */}
        <div>
          <h3 className="mb-4 text-foreground">Recent Entries</h3>
          <div className="space-y-3">
            {[
              { date: 'Today, 9:00 AM', type: 'Weight', value: '6.4 kg', icon: '⚖️' },
              { date: 'Yesterday, 10:30 AM', type: 'Height', value: '65 cm', icon: '📏' },
              { date: '2 days ago', type: 'Sleep', value: '14 hours', icon: '😴' },
            ].map((entry, index) => (
              <Card key={index} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {entry.icon}
                </div>
                <div className="flex-1">
                  <div className="text-foreground">{entry.type}</div>
                  <div className="text-sm text-muted-foreground">{entry.date}</div>
                </div>
                <div className="text-foreground">{entry.value}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Measurement Dialog */}
      <AddMeasurementDialog
        open={isAddMeasurementOpen}
        onClose={() => setIsAddMeasurementOpen(false)}
        onSave={handleAddMeasurement}
      />
    </div>
  );
}
