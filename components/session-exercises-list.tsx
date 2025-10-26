import { DndContext, closestCenter, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RoutineExerciseCard } from "@/components/routine-exercise-card";
import type { ExerciseWithSets } from "@/components/exercise-browser/types";
import type { DragEndEvent } from "@dnd-kit/core";

interface SessionExercisesListProps {
  exercises: ExerciseWithSets[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: number
  ) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onViewDetails: (exercise: ExerciseWithSets) => void;
}

export function SessionExercisesList({
  exercises,
  sensors,
  onDragEnd,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
  onViewDetails,
}: SessionExercisesListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No exercises in this routine. Add exercises to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Exercises ({exercises.length})
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={exercises.map((ex) => ex._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {exercises.map((exercise) => (
              <RoutineExerciseCard
                key={exercise._id}
                exercise={exercise}
                onRemoveExercise={() => onRemoveExercise(exercise._id)}
                onAddSet={() => onAddSet(exercise._id)}
                onRemoveSet={(setId) => onRemoveSet(exercise._id, setId)}
                onUpdateSet={(setId, field, value) =>
                  onUpdateSet(exercise._id, setId, field, value)
                }
                onToggleComplete={(setId) =>
                  onToggleComplete(exercise._id, setId)
                }
                onViewDetails={() => onViewDetails(exercise)}
                showComplete={true}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
