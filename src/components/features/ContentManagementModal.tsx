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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Eye,
  Calendar,
  User,
  Clock,
  Save,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'policy' | 'procedure' | 'guide' | 'template';
  status: 'published' | 'draft' | 'review' | 'archived';
  author: string;
  lastModified: string;
  category: string;
  tags: string[];
  wordCount: number;
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Employee Onboarding Guide',
    type: 'guide',
    status: 'published',
    author: 'Sarah Johnson',
    lastModified: '2024-01-15',
    category: 'HR',
    tags: ['onboarding', 'training', 'hr'],
    wordCount: 1250
  },
  {
    id: '2',
    title: 'Data Security Policy',
    type: 'policy',
    status: 'review',
    author: 'John Smith',
    lastModified: '2024-01-14',
    category: 'Security',
    tags: ['security', 'policy', 'compliance'],
    wordCount: 850
  },
  {
    id: '3',
    title: 'Remote Work Procedures',
    type: 'procedure',
    status: 'draft',
    author: 'Mike Davis',
    lastModified: '2024-01-12',
    category: 'Operations',
    tags: ['remote', 'procedures', 'operations'],
    wordCount: 650
  },
  {
    id: '4',
    title: 'Client Meeting Template',
    type: 'template',
    status: 'published',
    author: 'Emma Wilson',
    lastModified: '2024-01-10',
    category: 'Templates',
    tags: ['meeting', 'client', 'template'],
    wordCount: 300
  }
];

export const ContentManagementModal: React.FC<ContentManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    category: '',
    type: 'article' as const,
    tags: ''
  });
  const { toast } = useToast();

  const filteredContent = mockContent.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      case 'procedure': return 'bg-orange-100 text-orange-800';
      case 'guide': return 'bg-teal-100 text-teal-800';
      case 'template': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveContent = () => {
    toast({
      title: "Content Saved",
      description: `${newContent.title || 'New content'} has been saved successfully.`,
    });
    setNewContent({ title: '', content: '', category: '', type: 'article', tags: '' });
    setIsEditing(false);
  };

  const handlePublishContent = (contentId: string) => {
    toast({
      title: "Content Published",
      description: "Content has been published and is now live.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Content Management System</span>
          </DialogTitle>
          <DialogDescription>
            Create, edit, and manage content across your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Content</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                setIsEditing(true);
                setActiveTab('create');
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content List */}
              <div className="space-y-4">
                <h3 className="font-medium">Content Library ({filteredContent.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredContent.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${selectedContent?.id === item.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedContent(item)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                {item.type}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{item.lastModified}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3" />
                            <span>{item.wordCount} words</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div className="space-y-4">
                <h3 className="font-medium">Content Preview</h3>
                {selectedContent ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedContent.title}</CardTitle>
                          <CardDescription>Category: {selectedContent.category}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          {selectedContent.status === 'draft' && (
                            <Button 
                              size="sm"
                              onClick={() => handlePublishContent(selectedContent.id)}
                            >
                              Publish
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <Badge className={`text-xs ${getTypeColor(selectedContent.type)}`}>
                            {selectedContent.type}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <Badge className={`text-xs ${getStatusColor(selectedContent.status)}`}>
                            {selectedContent.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Author</Label>
                          <p className="font-medium">{selectedContent.author}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Word Count</Label>
                          <p className="font-medium">{selectedContent.wordCount}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedContent.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Content Preview</h4>
                        <p className="text-sm text-muted-foreground">
                          This would show a preview of the actual content. In a real implementation, 
                          this would display the formatted content, images, and other media.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Select content to view details</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Content</CardTitle>
                <CardDescription>Write and publish new content for your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      placeholder="Enter content title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newContent.category}
                      onChange={(e) => setNewContent({...newContent, category: e.target.value})}
                      placeholder="e.g., HR, Security, Operations"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newContent.tags}
                    onChange={(e) => setNewContent({...newContent, tags: e.target.value})}
                    placeholder="e.g., policy, training, remote-work"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    placeholder="Write your content here..."
                    className="min-h-64"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSaveContent}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button variant="outline" onClick={handleSaveContent}>
                    Save & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Policy Document', description: 'Standard company policy template' },
                { name: 'Procedure Guide', description: 'Step-by-step procedure template' },
                { name: 'Training Material', description: 'Employee training content template' },
                { name: 'Meeting Notes', description: 'Meeting notes and action items template' },
                { name: 'Project Brief', description: 'Project overview and requirements template' },
                { name: 'FAQ Document', description: 'Frequently asked questions template' },
              ].map((template, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{mockContent.length}</span>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {mockContent.filter(c => c.status === 'published').length}
                    </span>
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-yellow-600">
                      {mockContent.filter(c => c.status === 'review').length}
                    </span>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Track content engagement and effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Content analytics dashboard</p>
                    <p className="text-sm">Views, engagement, and performance metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};