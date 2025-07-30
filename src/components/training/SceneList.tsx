import { SceneItem } from "./SceneItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document' | 'document_builder';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  thumbnail_url: string | null;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  is_completion_scene: boolean;
  auto_advance: boolean;
  completion_criteria: any;
  metadata: any;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

interface SceneListProps {
  scenes: TrainingScene[];
  onEdit: (scene: TrainingScene) => void;
  onDelete: (id: string) => void;
  onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  onToggleCompletionScene: (sceneId: string) => void;
  onManageQuestions: (scene: TrainingScene) => void;
  onDragEnd: (result: any) => void;
}

export const SceneList = ({
  scenes,
  onEdit,
  onDelete,
  onMoveScene,
  onToggleCompletionScene,
  onManageQuestions,
  onDragEnd,
}: SceneListProps) => {
  if (scenes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No training scenes created yet. Use the quick add buttons above to get started.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="scenes">
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-muted/30 rounded-lg p-2' : ''}`}
          >
            {scenes.map((scene, index) => (
              <Draggable key={scene.id} draggableId={scene.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-all duration-200 ${
                      snapshot.isDragging 
                        ? 'transform rotate-2 scale-105 shadow-lg z-50' 
                        : ''
                    }`}
                  >
                    <SceneItem
                      scene={scene}
                      index={index}
                      totalScenes={scenes.length}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMoveScene={onMoveScene}
                      onToggleCompletionScene={onToggleCompletionScene}
                      onManageQuestions={onManageQuestions}
                      dragHandleProps={provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};