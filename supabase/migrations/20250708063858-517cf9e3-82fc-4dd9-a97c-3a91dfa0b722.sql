-- Function to create assessment completion notification and achievements
CREATE OR REPLACE FUNCTION public.handle_assessment_completion()
RETURNS TRIGGER AS $$
DECLARE
  assignee_id UUID;
  completion_notification_id UUID;
  achievement_earned BOOLEAN := false;
BEGIN
  -- Only process when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Create completion notifications for all assigned users
    IF NEW.assigned_to IS NOT NULL THEN
      FOREACH assignee_id IN ARRAY NEW.assigned_to LOOP
        INSERT INTO public.assessment_notifications (
          assessment_id,
          user_id,
          notification_type,
          title,
          message,
          action_url,
          metadata
        ) VALUES (
          NEW.id,
          assignee_id,
          'completion',
          'Assessment Completed!',
          'You have successfully completed the assessment: ' || NEW.company_name || ' Risk Assessment',
          '/admin/my-assessments',
          jsonb_build_object(
            'assessment_id', NEW.id,
            'risk_score', NEW.risk_score,
            'risk_level', NEW.risk_level,
            'completed_at', NEW.updated_at
          )
        ) RETURNING id INTO completion_notification_id;

        -- Award achievement points for assessment completion
        INSERT INTO public.user_points (user_id, company_id, total_points, points_this_month, points_this_week)
        VALUES (assignee_id, NULL, 25, 25, 25)
        ON CONFLICT (user_id, company_id)
        DO UPDATE SET
          total_points = user_points.total_points + 25,
          points_this_month = user_points.points_this_month + 25,
          points_this_week = user_points.points_this_week + 25,
          updated_at = now();

        -- Check for first assessment achievement
        IF NOT EXISTS (
          SELECT 1 FROM public.user_achievements 
          WHERE user_id = assignee_id 
          AND achievement_id = (SELECT id FROM public.achievement_definitions WHERE name = 'Risk Assessment Pro')
        ) THEN
          -- Award first assessment achievement
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          SELECT assignee_id, id, jsonb_build_object('assessment_id', NEW.id, 'risk_score', NEW.risk_score)
          FROM public.achievement_definitions 
          WHERE name = 'Risk Assessment Pro';
          
          achievement_earned := true;
        END IF;

        -- Notify about achievement if earned
        IF achievement_earned THEN
          INSERT INTO public.assessment_notifications (
            assessment_id,
            user_id,
            notification_type,
            title,
            message,
            action_url,
            metadata
          ) VALUES (
            NEW.id,
            assignee_id,
            'completion',
            '🏆 Achievement Unlocked!',
            'You earned the "Risk Assessment Pro" achievement for completing your first assessment!',
            '/admin/my-achievements',
            jsonb_build_object('achievement', 'Risk Assessment Pro', 'points_earned', 50)
          );
        END IF;

      END LOOP;
    END IF;

    -- Notify the assignor (if different from assignee)
    IF NEW.assigned_by IS NOT NULL AND NEW.assigned_by != ALL(COALESCE(NEW.assigned_to, ARRAY[]::UUID[])) THEN
      INSERT INTO public.assessment_notifications (
        assessment_id,
        user_id,
        notification_type,
        title,
        message,
        action_url,
        metadata
      ) VALUES (
        NEW.id,
        NEW.assigned_by,
        'completion',
        'Assessment Completed',
        'An assessment you assigned has been completed for: ' || NEW.company_name,
        '/admin/assessments?filter=completed',
        jsonb_build_object(
          'assessment_id', NEW.id,
          'completed_by', NEW.assigned_to,
          'risk_score', NEW.risk_score
        )
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assessment completion
DROP TRIGGER IF EXISTS assessment_completion_trigger ON public.assessments;
CREATE TRIGGER assessment_completion_trigger
AFTER UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.handle_assessment_completion();

-- Add updated_at trigger for assessment notifications
CREATE TRIGGER update_assessment_notifications_updated_at
BEFORE UPDATE ON public.assessment_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER TABLE public.assessment_notifications REPLICA IDENTITY FULL;