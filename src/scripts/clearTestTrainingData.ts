import { supabase } from "@/integrations/supabase/client";

export async function clearTestTrainingData() {
  try {
    console.log('🧹 Starting cleanup of test training data...');

    // First, delete scene question responses
    const { error: responsesError } = await supabase
      .from('scene_question_responses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (responsesError) {
      console.error('Error deleting question responses:', responsesError);
    } else {
      console.log('✅ Deleted scene question responses');
    }

    // Delete scene question options
    const { error: optionsError } = await supabase
      .from('scene_question_options')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (optionsError) {
      console.error('Error deleting question options:', optionsError);
    } else {
      console.log('✅ Deleted scene question options');
    }

    // Delete scene questions
    const { error: questionsError } = await supabase
      .from('scene_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (questionsError) {
      console.error('Error deleting scene questions:', questionsError);
    } else {
      console.log('✅ Deleted scene questions');
    }

    // Delete scene completions
    const { error: completionsError } = await supabase
      .from('scene_completions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (completionsError) {
      console.error('Error deleting scene completions:', completionsError);
    } else {
      console.log('✅ Deleted scene completions');
    }

    // Delete training scenes
    const { error: scenesError } = await supabase
      .from('training_scenes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (scenesError) {
      console.error('Error deleting training scenes:', scenesError);
    } else {
      console.log('✅ Deleted training scenes');
    }

    // Delete certificates
    const { error: certificatesError } = await supabase
      .from('certificates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (certificatesError) {
      console.error('Error deleting certificates:', certificatesError);
    } else {
      console.log('✅ Deleted certificates');
    }

    // Delete training completions
    const { error: trainingCompletionsError } = await supabase
      .from('training_completions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (trainingCompletionsError) {
      console.error('Error deleting training completions:', trainingCompletionsError);
    } else {
      console.log('✅ Deleted training completions');
    }

    // Delete training assignments
    const { error: assignmentsError } = await supabase
      .from('training_assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (assignmentsError) {
      console.error('Error deleting training assignments:', assignmentsError);
    } else {
      console.log('✅ Deleted training assignments');
    }

    // Finally, delete training modules
    const { error: modulesError } = await supabase
      .from('training_modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (modulesError) {
      console.error('Error deleting training modules:', modulesError);
    } else {
      console.log('✅ Deleted training modules');
    }

    console.log('🎉 Test training data cleanup completed successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}