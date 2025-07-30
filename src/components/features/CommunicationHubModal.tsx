import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send,
  Phone,
  Video,
  Bell,
  Users,
  Hash,
  Plus,
  Settings,
  Search
} from "lucide-react";

interface CommunicationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  members: number;
  unread: number;
  lastMessage: string;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    user: 'Sarah Johnson',
    message: 'Hey team! The Q1 compliance reports are ready for review.',
    timestamp: '14:30',
    avatar: 'SJ'
  },
  {
    id: '2',
    user: 'Mike Davis',
    message: 'Great work! I\'ll take a look at them this afternoon.',
    timestamp: '14:32',
    avatar: 'MD'
  },
  {
    id: '3',
    user: 'Emma Wilson',
    message: 'Should we schedule a meeting to discuss the findings?',
    timestamp: '14:35',
    avatar: 'EW'
  }
];

const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'general',
    type: 'public',
    members: 25,
    unread: 3,
    lastMessage: 'Team meeting at 3 PM'
  },
  {
    id: '2',
    name: 'compliance-team',
    type: 'private',
    members: 8,
    unread: 1,
    lastMessage: 'Q1 reports completed'
  },
  {
    id: '3',
    name: 'hr-announcements',
    type: 'public',
    members: 45,
    unread: 0,
    lastMessage: 'Holiday schedule updated'
  }
];

export const CommunicationHubModal: React.FC<CommunicationHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication Hub</span>
          </DialogTitle>
          <DialogDescription>
            Team collaboration and communication center
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-96 overflow-hidden">{/* Added overflow-hidden to contain scrolling */}
          {/* Sidebar - Channels */}
          <div className="col-span-3 border-r">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Channels</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels..."
                  className="pl-10 h-8"
                />
              </div>

              <div className="space-y-1">
                {mockChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${
                      selectedChannel?.id === channel.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{channel.name}</span>
                    </div>
                    {channel.unread > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Team Members</h4>
                <div className="space-y-2">
                  {['Sarah Johnson', 'Mike Davis', 'Emma Wilson'].map((member) => (
                    <div key={member} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50 cursor-pointer">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-9 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">{selectedChannel?.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedChannel?.members} members
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-64">{/* Added scrolling to messages area */}
              {mockMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{message.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{message.user}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <p className="text-sm mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder={`Message #${selectedChannel?.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="mt-4 overflow-y-auto max-h-60">{/* Added scrolling to tabs content */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'Sarah joined #compliance-team',
                      'New message in #general',
                      'Mike mentioned you in #hr-announcements'
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Bell className="h-3 w-3 text-muted-foreground" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Hash className="h-4 w-4 mr-2" />
                    New Channel
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Start Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Calendar', description: 'Sync team calendars' },
                { name: 'File Sharing', description: 'Share documents seamlessly' },
                { name: 'Task Management', description: 'Link tasks and projects' }
              ].map((integration, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Configure your communication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure when and how you receive notifications from team communications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};