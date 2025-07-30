-- Add client_id and related_employees fields to cases table
ALTER TABLE cases ADD COLUMN client_id uuid REFERENCES clients(id);
ALTER TABLE cases ADD COLUMN related_employees uuid[];

-- Create index for better query performance
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_related_employees ON cases USING GIN(related_employees);