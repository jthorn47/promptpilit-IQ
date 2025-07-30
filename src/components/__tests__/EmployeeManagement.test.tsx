import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { waitFor, fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { EmployeeManagement } from '../EmployeeManagement';
import { createMockEmployee } from '@/test/test-utils';
import { supabase } from '@/integrations/supabase/client';

// Mock the entire Supabase module
vi.mock('@/integrations/supabase/client');

describe('EmployeeManagement', () => {
  const mockEmployee = createMockEmployee();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { company_id: 'company-1' },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [mockEmployee],
            error: null,
          }),
        }),
        order: vi.fn().mockResolvedValue({
          data: [mockEmployee],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('should render employee management dashboard', async () => {
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('Employee Management')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage your team members and their information')).toBeInTheDocument();
    expect(screen.getByText('Add Employee')).toBeInTheDocument();
  });

  it('should display employee statistics', async () => {
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
    });

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('should display employee list', async () => {
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john.doe@company.com')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('should open add employee dialog', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    const addButton = screen.getByText('Add Employee');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
  });

  it('should add new employee with form validation', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    // Open add dialog
    await user.click(screen.getByText('Add Employee'));

    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    // Fill out form
    await user.type(screen.getByLabelText('First Name *'), 'Jane');
    await user.type(screen.getByLabelText('Last Name *'), 'Smith');
    await user.type(screen.getByLabelText('Email *'), 'jane.smith@company.com');
    await user.type(screen.getByLabelText('Position'), 'Product Manager');
    await user.type(screen.getByLabelText('Department'), 'Product');

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('employees');
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    await user.click(screen.getByText('Add Employee'));

    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    // Fill with invalid email
    await user.type(screen.getByLabelText('First Name *'), 'Test');
    await user.type(screen.getByLabelText('Last Name *'), 'User');
    await user.type(screen.getByLabelText('Email *'), 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'Add Employee' });
    await user.click(submitButton);

    // Should not proceed with invalid email
    expect(supabase.from).not.toHaveBeenCalledWith('employees');
  });

  it('should filter employees by search term', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search employees...');
    await user.type(searchInput, 'Jane');

    // Should filter out John Doe
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('should handle delete employee', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click dropdown menu
    const moreButton = screen.getByRole('button', { name: '' });
    await user.click(moreButton);

    // Click delete
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('employees');
    });
  });

  it('should handle edit employee', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click dropdown menu
    const moreButton = screen.getByRole('button', { name: '' });
    await user.click(moreButton);

    // Click edit
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    });

    // Form should be pre-filled
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@company.com')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock loading state
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        }),
      }),
    });

    render(<EmployeeManagement />);

    expect(screen.getByText('Loading employees...')).toBeInTheDocument();
  });

  it('should handle empty employee list', async () => {
    // Mock empty employees
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { company_id: 'company-1' },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    render(<EmployeeManagement />);

    await waitFor(() => {
      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });

    expect(screen.getByText('Get started by adding your first team member')).toBeInTheDocument();
    expect(screen.getByText('Add First Employee')).toBeInTheDocument();
  });

  it('should apply rate limiting on form submission', async () => {
    const user = userEvent.setup();
    render(<EmployeeManagement />);

    await user.click(screen.getByText('Add Employee'));

    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    // Fill and submit form multiple times rapidly
    for (let i = 0; i < 6; i++) {
      await user.clear(screen.getByLabelText('First Name *'));
      await user.clear(screen.getByLabelText('Last Name *'));
      await user.clear(screen.getByLabelText('Email *'));
      
      await user.type(screen.getByLabelText('First Name *'), `User${i}`);
      await user.type(screen.getByLabelText('Last Name *'), `Test${i}`);
      await user.type(screen.getByLabelText('Email *'), `user${i}@test.com`);

      const submitButton = screen.getByRole('button', { name: 'Add Employee' });
      await user.click(submitButton);
    }

    // Should be rate limited after 5 attempts
    // The 6th attempt should not call the database
    expect(supabase.from).toHaveBeenCalledTimes(5); // 5 successful submissions before rate limit
  });
});