-- Create function for logging AI assistant interactions (fixed parameters)
CREATE OR REPLACE FUNCTION public.log_ai_assistant_interaction(
  conversation_id TEXT,
  training_module_id TEXT,
  module_name TEXT,
  topic TEXT,
  question TEXT,
  response TEXT,
  user_role TEXT DEFAULT NULL,
  current_section TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.ai_assistant_logs (
    conversation_id,
    training_module_id,
    module_name,
    topic,
    user_role,
    current_section,
    question,
    response,
    timestamp
  ) VALUES (
    conversation_id,
    training_module_id,
    module_name,
    topic,
    user_role,
    current_section,
    question,
    response,
    now()
  );
END;
$$;