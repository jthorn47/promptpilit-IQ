-- Fix RLS policies for widget system tables

-- RLS policies for widget_definitions (allow all authenticated users to read)
CREATE POLICY "Allow all authenticated users to read widget definitions"
ON public.widget_definitions
FOR SELECT
TO authenticated
USING (true);

-- RLS policies for user_widget_preferences (users can only manage their own preferences)
CREATE POLICY "Users can view their own widget preferences"
ON public.user_widget_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget preferences"
ON public.user_widget_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences"
ON public.user_widget_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget preferences"
ON public.user_widget_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);