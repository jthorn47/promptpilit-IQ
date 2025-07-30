import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [inquiryType, setInquiryType] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const inquiryTypes = [
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Account' },
    { value: 'sales', label: 'Sales Inquiry' },
    { value: 'demo', label: 'Request Demo' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inquiryType || !name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call (replace with actual contact form submission)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us! We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setInquiryType('');
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailDirect = () => {
    window.open('mailto:support@easelearn.com?subject=Support Request', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Our Support Team
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email Support</span>
              </div>
              <p className="text-sm text-muted-foreground">support@easelearn.com</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEmailDirect}
                className="w-full"
              >
                Send Email
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Response Time</span>
              </div>
              <p className="text-sm text-muted-foreground">Within 24 hours</p>
              <p className="text-xs text-muted-foreground">Monday - Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <h3 className="font-medium mb-4">Send us a message</h3>
            
            {/* Inquiry Type */}
            <div className="space-y-2">
              <Label htmlFor="inquiryType">Type of Inquiry *</Label>
              <Select value={inquiryType} onValueChange={setInquiryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  {inquiryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                placeholder="Your company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Please describe your inquiry or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>

          {/* Additional Contact Options */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              For urgent technical issues, please email us directly at{' '}
              <a 
                href="mailto:support@easelearn.com" 
                className="text-primary hover:underline"
              >
                support@easelearn.com
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};