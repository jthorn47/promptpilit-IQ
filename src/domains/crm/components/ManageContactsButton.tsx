import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ManageContactsButton = () => {
  return (
    <Button variant="outline" className="w-full" asChild>
      <Link to="/crm/contacts">
        <span className="flex items-center justify-center gap-2">
          Manage Contacts
        </span>
      </Link>
    </Button>
  );
};

export default ManageContactsButton;