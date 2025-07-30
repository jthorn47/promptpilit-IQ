-- Add missing foreign key constraint between adaptive_quiz_sessions and training_modules
ALTER TABLE public.adaptive_quiz_sessions 
ADD CONSTRAINT fk_adaptive_quiz_sessions_training_module 
FOREIGN KEY (training_module_id) REFERENCES public.training_modules(id);