"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function FloatingSessionButton() {
  const router = useRouter();
  const activeSession = useQuery(api.sessions.getActiveSession);
  const sessionWithExercises = useQuery(
    api.sessions.getSessionWithExercises,
    activeSession ? { sessionId: activeSession._id } : "skip"
  );

  // Don't render if no active session
  if (!activeSession || !sessionWithExercises) {
    return null;
  }

  // Calculate progress
  const totalSets = sessionWithExercises.exercises.reduce(
    (acc: number, exercise: any) => acc + exercise.sets.length,
    0
  );
  const completedSets = sessionWithExercises.exercises.reduce(
    (acc: number, exercise: any) =>
      acc + exercise.sets.filter((set: any) => set.completed).length,
    0
  );
  const progressPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleClick = () => {
    if (activeSession.routineId) {
      router.push(`/workout/${activeSession.routineId}/session`);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            size="lg"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
            aria-label="Active workout session"
          >
            <div className="relative">
              <Dumbbell className="h-6 w-6" />
              {completedSets > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {completedSets}
                </Badge>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{activeSession.routineName}</p>
            <p className="text-sm text-muted-foreground">
              {completedSets}/{totalSets} sets completed ({progressPercentage}%)
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionWithExercises.exercises.length} exercises
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
