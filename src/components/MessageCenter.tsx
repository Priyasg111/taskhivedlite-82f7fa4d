
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";

// Sample data - would come from Supabase in a real implementation
const sampleContacts = [
  { id: "user-1", name: "Alice Smith", role: "Project Manager", status: "online", avatar: "" },
  { id: "user-2", name: "Bob Johnson", role: "Quality Assurance", status: "offline", avatar: "" },
  { id: "user-3", name: "Charlie Wong", role: "Task Reviewer", status: "away", avatar: "" },
];

const sampleMessages = [
  { id: "msg-1", senderId: "user-1", text: "Hi there! Can you help me with this task?", timestamp: "2025-04-14T10:30:00Z" },
  { id: "msg-2", senderId: "current-user", text: "Sure, what do you need help with?", timestamp: "2025-04-14T10:32:00Z" },
  { id: "msg-3", senderId: "user-1", text: "I'm having trouble with the data labeling instructions.", timestamp: "2025-04-14T10:33:00Z" },
  { id: "msg-4", senderId: "current-user", text: "Let me check the guidelines and get back to you.", timestamp: "2025-04-14T10:35:00Z" },
];

const MessageCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState(sampleContacts[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(sampleMessages);

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Message Center</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to view your messages.
        </p>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    // Simulate receiving a response (in a real app, this would be through a WebSocket)
    setTimeout(() => {
      const response = {
        id: `msg-${Date.now() + 1}`,
        senderId: selectedContact.id,
        text: "Thanks for your message! I'll review this soon.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Message Center</h2>
      <div className="flex flex-1 overflow-hidden border rounded-md">
        {/* Contacts sidebar */}
        <div className="w-1/3 border-r">
          <div className="p-3 border-b">
            <Input placeholder="Search contacts..." className="text-sm" />
          </div>
          <ScrollArea className="h-[550px]">
            {sampleContacts.map(contact => (
              <div
                key={contact.id}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  selectedContact.id === contact.id 
                    ? "bg-muted/60" 
                    : "hover:bg-muted/30"
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="text-xs">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        contact.status === 'online' 
                          ? 'bg-green-500' 
                          : contact.status === 'away' 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedContact.avatar} />
              <AvatarFallback className="text-xs">
                {selectedContact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedContact.name}</p>
              <p className="text-xs text-muted-foreground">{selectedContact.role}</p>
            </div>
          </div>
          
          {/* Message history */}
          <ScrollArea className="flex-1 p-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderId === 'current-user'
                      ? 'bg-brand-blue text-white rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.senderId === 'current-user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
          
          {/* Message input */}
          <div className="p-3 border-t flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
