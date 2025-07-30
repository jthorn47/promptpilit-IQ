-- Add CASCADE deletion for training module relationships
-- This will automatically delete related records when a training module is deleted

-- Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE training_scenes DROP CONSTRAINT IF EXISTS training_scenes_training_module_id_fkey;
ALTER TABLE training_scenes ADD CONSTRAINT training_scenes_training_module_id_fkey 
  FOREIGN KEY (training_module_id) REFERENCES training_modules(id) ON DELETE CASCADE;

ALTER TABLE training_assignments DROP CONSTRAINT IF EXISTS training_assignments_training_module_id_fkey;
ALTER TABLE training_assignments ADD CONSTRAINT training_assignments_training_module_id_fkey 
  FOREIGN KEY (training_module_id) REFERENCES training_modules(id) ON DELETE CASCADE;

ALTER TABLE training_completions DROP CONSTRAINT IF EXISTS training_completions_training_module_id_fkey;
ALTER TABLE training_completions ADD CONSTRAINT training_completions_training_module_id_fkey 
  FOREIGN KEY (training_module_id) REFERENCES training_modules(id) ON DELETE CASCADE;

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_training_module_id_fkey;
ALTER TABLE certificates ADD CONSTRAINT certificates_training_module_id_fkey 
  FOREIGN KEY (training_module_id) REFERENCES training_modules(id) ON DELETE CASCADE;

ALTER TABLE renewal_history DROP CONSTRAINT IF EXISTS renewal_history_training_module_id_fkey;
ALTER TABLE renewal_history ADD CONSTRAINT renewal_history_training_module_id_fkey 
  FOREIGN KEY (training_module_id) REFERENCES training_modules(id) ON DELETE CASCADE;