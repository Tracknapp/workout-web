"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Dumbbell, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";

export default function WorkoutHistoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const sessionId = id as Id<"workoutSessions">;

  const session = useQuery(api.sessions.getSessionWithExercises, { sessionId });

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading workout details...</p>
        </div>
      </div>
    );
  }

  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return "N/A";
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const totalSets = session.exercises.reduce(
    (acc, exercise) => acc + exercise.sets.length,
    0
  );
  const completedSets = session.exercises.reduce(
    (acc, exercise) =>
      acc + exercise.sets.filter((set) => set.completed).length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {session.routineName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              <span>
                {format(new Date(session.startTime), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            {session.endTime && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{formatDuration(session.startTime, session.endTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{session.exercises.length}</div>
          <div className="text-sm text-muted-foreground">Exercises</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{completedSets}/{totalSets}</div>
          <div className="text-sm text-muted-foreground">Sets Completed</div>
        </div>
        <div className="bg-card border rounded-lg p-4 col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold">
            {formatDuration(session.startTime, session.endTime)}
          </div>
          <div className="text-sm text-muted-foreground">Duration</div>
        </div>
      </div>

      {/* Exercises List */}
      {session.exercises.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Exercises ({session.exercises.length})
          </h2>
          <div className="grid gap-4">
            {session.exercises.map((exercise) => (
              <div
                key={exercise._id}
                className="bg-card border rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  {exercise.gifUrl && (
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.exerciseName}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {exercise.exerciseName}
                    </h3>
                    {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {exercise.targetMuscles.map((muscle: string) => (
                          <span
                            key={muscle}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sets Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                              Set
                            </th>
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                              Reps
                            </th>
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                              Weight ({exercise.sets[0]?.weightUnit || "lbs"})
                            </th>
                            <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                              Done
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set) => (
                            <tr key={set._id} className="border-b last:border-0">
                              <td className="py-2 px-2">{set.setNumber}</td>
                              <td className="py-2 px-2">{set.reps}</td>
                              <td className="py-2 px-2">
                                {set.weight ? `${set.weight}` : "-"}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {set.completed ? (
                                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                                ) : (
                                  <div className="size-5 border-2 rounded-full mx-auto" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Dumbbell className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No exercises in this workout</p>
        </div>
      )}
    </div>
  );
}
