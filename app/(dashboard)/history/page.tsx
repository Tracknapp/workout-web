"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Dumbbell, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function WorkoutHistory() {
  const router = useRouter();
  const completedSessions = useQuery(api.sessions.getUserSessions, {
    status: "completed",
  });

  if (!completedSessions) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  const formatDuration = (startTime: number, endTime: number) => {
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Workout History</h1>
        <p className="text-muted-foreground mt-1">
          View your completed workouts
        </p>
      </div>

      {/* Sessions List */}
      {completedSessions.length > 0 ? (
        <div className="space-y-3">
          {completedSessions.map((session) => (
            <button
              key={session._id}
              onClick={() => router.push(`/history/${session._id}`)}
              className="w-full bg-card border rounded-lg p-4 hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {session.routineName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>
                        {formatDistanceToNow(new Date(session.startTime), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {session.endTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>
                          {formatDuration(session.startTime, session.endTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Dumbbell className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Workout History</h3>
          <p className="text-muted-foreground mb-4">
            Complete your first workout to see it here
          </p>
          <Button onClick={() => router.push("/workout")}>
            Browse Routines
          </Button>
        </div>
      )}
    </div>
  );
}
