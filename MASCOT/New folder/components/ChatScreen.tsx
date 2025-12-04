import { useState, useRef, useEffect } from 'react';
import { AppBar } from './AppBar';
import { BabyBuddy } from './BabyBuddy';
import { Send, Mic, Image as ImageIcon } from 'lucide-react';
import { Card } from './ui/card';

interface ChatScreenProps {
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function ChatScreen({ onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi Sarah! I'm Baby Buddy, your AI parenting assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('sleep')) {
      return "For better sleep, try establishing a consistent bedtime routine. Babies thrive on predictability. A warm bath, gentle lullaby, and dimmed lights can signal it's time to sleep. Most babies need 12-16 hours of sleep per day, including naps.";
    } else if (lowerMessage.includes('feed')) {
      return "Newborns typically feed every 2-3 hours. Watch for hunger cues like rooting, hand-to-mouth movements, or fussiness. Remember, every baby is unique - some may need more or less frequent feedings.";
    } else if (lowerMessage.includes('cry')) {
      return "Babies cry to communicate needs. Common reasons include hunger, tiredness, discomfort (wet diaper, too hot/cold), or need for comfort. Try the 5 S's: Swaddle, Side position, Shush, Swing, and Suck. If crying persists, consult your pediatrician.";
    }
    return "That's a great question! I'm here to help with parenting advice, baby development milestones, feeding schedules, sleep training, and more. What would you like to know specifically?";
  };

  const quickReplies = [
    'Sleep tips?',
    'Feeding schedule',
    'Developmental milestones',
    'Crying reasons',
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <AppBar title="AI Chat" subtitle="Baby Buddy" showBack onBack={onBack} actions={['menu']} />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 mt-1">
                <BabyBuddy size="sm" animate={false} />
              </div>
            )}
            
            <Card
              className={`max-w-[75%] p-4 ${
                message.sender === 'ai'
                  ? 'bg-white'
                  : 'bg-gradient-to-r from-[#FADADD] to-[#FFB6C1] border-none'
              }`}
            >
              <p className="text-sm text-foreground">{message.text}</p>
              <div className="text-xs text-muted-foreground mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Quick Replies */}
        {messages.length === 1 && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground text-center">Quick questions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    setInputValue(reply);
                  }}
                  className="px-4 py-2 rounded-full bg-white border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-border bg-white pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-end gap-2">
            <button className="p-3 rounded-full hover:bg-muted transition-colors">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex-1 bg-[#F5F5F5] rounded-3xl px-4 py-2 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button className="p-1">
                <Mic className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 rounded-full bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-[#2C3E50]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
