"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReusableDialog } from "@/components/reusable-dialog";
import { PencilIcon, Play, PlusCircle, TrashIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Id } from "@/convex/_generated/dataModel";

export default function NewWorkout() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Id<"routines"> | null>(
    null
  );

  const createRoutine = useMutation(api.routines.createRoutine);
  const deleteRoutine = useMutation(api.routines.deleteRoutine);
  const routines = useQuery(api.routines.getUserRoutines);

  const handleCreateRoutine = async () => {
    const nameToCreate = routineName.trim();

    try {
      await createRoutine({ name: nameToCreate });
      toast.success("Routine created successfully!");
      setRoutineName("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create routine:", error);
      toast.error("Failed to create routine. Please try again.");
    }
  };

  const handleDeleteClick = (routineId: Id<"routines">) => {
    setRoutineToDelete(routineId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;

    try {
      await deleteRoutine({ routineId: routineToDelete });
      toast.success("Routine deleted successfully!");
      setDeleteDialogOpen(false);
      setRoutineToDelete(null);
    } catch (error) {
      console.error("Failed to delete routine:", error);
      toast.error("Failed to delete routine. Please try again.");
    }
  };

  return (
    <div>
      <ReusableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Routine"
        description="Enter a name for your new workout routine."
        confirmText="Create"
        cancelText="Cancel"
        onConfirm={handleCreateRoutine}
        disableConfirm={!routineName.trim()}
      >
        <Input
          placeholder="Routine name"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && routineName.trim()) {
              handleCreateRoutine();
            }
          }}
        />
      </ReusableDialog>

      <ReusableDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Routine"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteRoutine}
        confirmVariant="destructive"
      >
        <div className="text-sm">
          Are you sure you want to delete this routine? This will permanently
          delete the routine and all exercises with their sets. This action cannot be
          undone.
        </div>
      </ReusableDialog>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">
          My routines ({routines?.length ?? 0})
        </span>
        <Button
          className="cursor-pointer rounded-md flex items-center gap-2"
          variant={"outline"}
          onClick={() => setDialogOpen(true)}
        >
          <PlusCircle /> New Routine
        </Button>
      </div>

      <ScrollArea className="rounded-md border mt-4 h-[calc(100vh-10rem)]">
        <div className="p-4">
          {routines?.map((routine) => (
            <div
              key={routine._id}
              className="flex items-center justify-between p-2 border mt-4 rounded-xl"
            >
              <div className="flex flex-col items-baseline ">
                <span className="text-lg font-bold">{routine.name}</span>
                <span className="text-sm text-muted-foreground">
                  {routine.exerciseCount} {routine.exerciseCount === 1 ? 'exercise' : 'exercises'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => router.push(`/workout/${routine._id}/session`)}
                  title="Start workout"
                >
                  <Play className="size-4" />
                </Button>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => router.push(`/workout/${routine._id}`)}
                  title="Edit routine"
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => handleDeleteClick(routine._id)}
                  title="Delete routine"
                >
                  <TrashIcon className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
