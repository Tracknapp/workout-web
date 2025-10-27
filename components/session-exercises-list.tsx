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
    field: "reps" | "weight" | "time",
    value: number | string
  ) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onViewDetails: (exercise: ExerciseWithSets) => void;
  weightUnit?: "lbs" | "kgs";
  distanceUnit?: "km" | "m";
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
  weightUnit = "lbs",
  distanceUnit = "km",
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
                onUpdateSet={(exerciseId, setId, field, value) =>
                  onUpdateSet(exerciseId, setId, field, value)
                }
                onToggleComplete={(exerciseId, setId) =>
                  onToggleComplete(exerciseId, setId)
                }
                onViewDetails={() => onViewDetails(exercise)}
                showComplete={true}
                weightUnit={weightUnit}
                distanceUnit={distanceUnit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
