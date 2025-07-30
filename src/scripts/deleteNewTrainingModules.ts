import { supabase } from "@/integrations/supabase/client";

export async function deleteNewTrainingModules() {
  try {
    console.log('🧹 Deleting training modules titled "New Training Module"...');

    // First, get all modules with the title "New Training Module"
    const { data: modules, error: fetchError } = await supabase
      .from('training_modules')
      .select('id')
      .eq('title', 'New Training Module');

    if (fetchError) {
      console.error('Error fetching modules:', fetchError);
      throw fetchError;
    }

    if (!modules || modules.length === 0) {
      console.log('No modules titled "New Training Module" found');
      return { success: true, deletedCount: 0 };
    }

    const moduleIds = modules.map(m => m.id);
    console.log(`Found ${moduleIds.length} modules to delete`);

    // Delete related data in correct order (respecting foreign key constraints)
    
    // For each module, delete all related data
    for (const moduleId of moduleIds) {
      // Get scene IDs for this module
      const { data: scenes } = await supabase
        .from('training_scenes')
        .select('id')
        .eq('training_module_id', moduleId);

      if (scenes && scenes.length > 0) {
        const sceneIds = scenes.map(s => s.id);

        // Get question IDs for these scenes
        const { data: questions } = await supabase
          .from('scene_questions')
          .select('id')
          .in('scene_id', sceneIds);

        if (questions && questions.length > 0) {
          const questionIds = questions.map(q => q.id);

          // Delete scene question responses
          await supabase
            .from('scene_question_responses')
            .delete()
            .in('question_id', questionIds);

          // Delete scene question options
          await supabase
            .from('scene_question_options')
            .delete()
            .in('question_id', questionIds);
        }

        // Delete scene questions
        await supabase
          .from('scene_questions')
          .delete()
          .in('scene_id', sceneIds);

        // Delete scene completions
        await supabase
          .from('scene_completions')
          .delete()
          .in('scene_id', sceneIds);

        // Delete training scenes
        await supabase
          .from('training_scenes')
          .delete()
          .in('id', sceneIds);
      }

      // Delete certificates
      await supabase
        .from('certificates')
        .delete()
        .eq('training_module_id', moduleId);

      // Delete training completions
      await supabase
        .from('training_completions')
        .delete()
        .eq('training_module_id', moduleId);

      // Delete training assignments
      await supabase
        .from('training_assignments')
        .delete()
        .eq('training_module_id', moduleId);
    }

    // Finally, delete the training modules
    const { error: deleteError } = await supabase
      .from('training_modules')
      .delete()
      .eq('title', 'New Training Module');

    if (deleteError) {
      console.error('Error deleting training modules:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Successfully deleted ${moduleIds.length} "New Training Module" entries`);
    return { success: true, deletedCount: moduleIds.length };

  } catch (error) {
    console.error('❌ Error deleting New Training Modules:', error);
    throw error;
  }
}