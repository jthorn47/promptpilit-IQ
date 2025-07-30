import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/modules/HaaLO.CRM/types";

interface LeadCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  editData?: Lead | null;
}

export const LeadCreateDialog: React.FC<LeadCreateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    title: '',
    source: 'website',
    status: 'new',
    score: '',
    notes: '',
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        first_name: editData.first_name || '',
        last_name: editData.last_name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        company_name: editData.company_name || '',
        title: editData.title || '',
        source: editData.source || 'website',
        status: editData.status || 'new',
        score: editData.score?.toString() || '',
        notes: editData.notes || '',
      });
    }
  }, [editData]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser({ id: user.id, email: user.email || 'Unknown User' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) return;

    setSubmitting(true);
    try {
      const leadData = {
        ...formData,
        score: formData.score ? parseInt(formData.score) : null,
        assigned_to: currentUser?.id || 'unknown',
      };

      const success = await onSubmit(leadData);
      if (success) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      title: '',
      source: 'website',
      status: 'new',
      score: '',
      notes: '',
    });
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {editData ? 'Update the lead information' : 'Enter the details for the new lead'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => updateFormData('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => updateFormData('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => updateFormData('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select value={formData.source} onValueChange={(value) => updateFormData('source', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="nurturing">Nurturing</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Lead Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => updateFormData('score', e.target.value)}
              placeholder="Enter lead score"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Add any additional notes about this lead"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()}
            >
              {submitting ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Lead" : "Create Lead")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};