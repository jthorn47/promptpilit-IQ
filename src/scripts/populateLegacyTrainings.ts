import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface LegacyTraining {
  id: string;
  title: string;
  audienceType: string;
  language: string;
  status: string;
  description?: string;
  estimatedDuration?: number;
}

interface LegacyScene {
  id: string;
  trainingId: string;
  title: string;
  sceneType: string;
  order: number;
  video_url: string;
  description?: string;
  estimatedDuration?: number;
}

interface LegacyQuestion {
  id: string;
  trainingSceneId: string;
  description: string;
  type: 'true_false' | 'multiple_choice';
  correct_answer: string;
  options?: string[];
  explanation?: string;
}

export async function populateLegacyTrainings() {
  try {
    console.log('🎓 Starting legacy training import...');

    // Read Excel files
    const trainingsResponse = await fetch('/legacy-trainings.xlsx');
    const trainingsBuffer = await trainingsResponse.arrayBuffer();
    const trainingsWorkbook = XLSX.read(trainingsBuffer);
    const trainingsSheet = trainingsWorkbook.Sheets[trainingsWorkbook.SheetNames[0]];
    const trainingsData: LegacyTraining[] = XLSX.utils.sheet_to_json(trainingsSheet);

    const scenesResponse = await fetch('/legacy-training-scenes.xlsx');
    const scenesBuffer = await scenesResponse.arrayBuffer();
    const scenesWorkbook = XLSX.read(scenesBuffer);
    const scenesSheet = scenesWorkbook.Sheets[scenesWorkbook.SheetNames[0]];
    const scenesData: LegacyScene[] = XLSX.utils.sheet_to_json(scenesSheet);

    const questionsResponse = await fetch('/legacy-training-questions.xlsx');
    const questionsBuffer = await questionsResponse.arrayBuffer();
    const questionsWorkbook = XLSX.read(questionsBuffer);
    const questionsSheet = questionsWorkbook.Sheets[questionsWorkbook.SheetNames[0]];
    const questionsData: LegacyQuestion[] = XLSX.utils.sheet_to_json(questionsSheet);

    console.log('📊 Data loaded:', {
      trainings: trainingsData.length,
      scenes: scenesData.length,
      questions: questionsData.length
    });

    // Create training modules
    const createdTrainings = new Map();
    for (const training of trainingsData) {
      console.log(`📚 Creating training: ${training.title}`);
      
      const { data: trainingModule, error: trainingError } = await supabase
        .from('training_modules')
        .insert({
          title: training.title,
          description: training.description || `${training.audienceType} training in ${training.language}`,
          status: training.status || 'published',
          video_type: 'vimeo',
          estimated_duration: training.estimatedDuration || 30,
          is_required: true,
          credit_value: 1,
          quiz_enabled: true,
          passing_score: 80
        })
        .select()
        .single();

      if (trainingError) {
        console.error(`❌ Error creating training ${training.title}:`, trainingError);
        continue;
      }

      createdTrainings.set(training.id, trainingModule.id);
      console.log(`✅ Created training module: ${trainingModule.title}`);
    }

    // Create training scenes
    const createdScenes = new Map();
    for (const scene of scenesData) {
      const moduleId = createdTrainings.get(scene.trainingId);
      if (!moduleId) {
        console.warn(`⚠️ No training module found for scene ${scene.id}`);
        continue;
      }

      // Handle missing title field - use a fallback title if scene.title is null/undefined
      const sceneTitle = scene.title || `Scene ${scene.order || 'Untitled'}`;
      
      console.log(`🎬 Creating scene: ${sceneTitle} with video: ${scene.video_url}`);
      
      // Extract Vimeo video ID from URL and convert to embed URL
      let processedVideoUrl = scene.video_url;
      let vimeoVideoId = null;
      
      if (scene.video_url) {
        // If it's just a video ID (numbers only), create embed URL
        if (/^\d+$/.test(scene.video_url.trim())) {
          vimeoVideoId = scene.video_url.trim();
          processedVideoUrl = `https://player.vimeo.com/video/${vimeoVideoId}`;
          console.log(`🎥 Converted video ID ${vimeoVideoId} to embed URL: ${processedVideoUrl}`);
        }
        // If it's already a Vimeo URL, extract ID and convert to embed URL
        else if (scene.video_url.includes('vimeo.com')) {
          const vimeoMatch = scene.video_url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
          if (vimeoMatch) {
            vimeoVideoId = vimeoMatch[1];
            processedVideoUrl = `https://player.vimeo.com/video/${vimeoVideoId}`;
            console.log(`🎥 Extracted Vimeo ID: ${vimeoVideoId} from URL: ${scene.video_url}`);
            console.log(`🎥 Converted to embed URL: ${processedVideoUrl}`);
          }
        }
        // If it's already an embed URL, keep it as is
        else if (scene.video_url.includes('player.vimeo.com/video/')) {
          processedVideoUrl = scene.video_url;
          const embedMatch = scene.video_url.match(/player\.vimeo\.com\/video\/(\d+)/);
          if (embedMatch) {
            vimeoVideoId = embedMatch[1];
            console.log(`🎥 Using existing embed URL: ${processedVideoUrl} with ID: ${vimeoVideoId}`);
          }
        }
      }
      
      const { data: trainingScene, error: sceneError } = await supabase
        .from('training_scenes')
        .insert({
          training_module_id: moduleId,
          title: sceneTitle,
          description: scene.description || sceneTitle,
          scene_type: 'video',
          content_url: processedVideoUrl,
          scene_order: scene.order,
          estimated_duration: scene.estimatedDuration || 5,
          is_required: true,
          completion_criteria: {
            type: 'video_completion',
            required_percentage: 90
          },
          status: 'active'
        })
        .select()
        .single();

      if (sceneError) {
        console.error(`❌ Error creating scene ${scene.title}:`, sceneError);
        continue;
      }

      createdScenes.set(scene.id, trainingScene.id);
      console.log(`✅ Created scene: ${trainingScene.title}`);
    }

    // Create scene questions
    for (const question of questionsData) {
      const sceneId = createdScenes.get(question.trainingSceneId);
      if (!sceneId) {
        console.warn(`⚠️ No scene found for question ${question.id}`);
        continue;
      }

      console.log(`❓ Creating question for scene: ${question.trainingSceneId}`);
      
      const { data: sceneQuestion, error: questionError } = await supabase
        .from('scene_questions')
        .insert({
          scene_id: sceneId,
          question_text: question.description,
          question_type: question.type,
          question_order: 1,
          is_required: true,
          points: 1,
          explanation: question.explanation
        })
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Error creating question:`, questionError);
        continue;
      }

      // Create question options for multiple choice
      if (question.type === 'multiple_choice' && question.options) {
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i];
          const isCorrect = option === question.correct_answer;
          
          await supabase
            .from('scene_question_options')
            .insert({
              question_id: sceneQuestion.id,
              option_text: option,
              is_correct: isCorrect,
              option_order: i + 1
            });
        }
      }

      console.log(`✅ Created question with options`);
    }

    console.log('🎉 Legacy training import completed successfully!');
    return {
      success: true,
      trainings: createdTrainings.size,
      scenes: createdScenes.size,
      questions: questionsData.length
    };

  } catch (error) {
    console.error('❌ Error importing legacy trainings:', error);
    throw error;
  }
}