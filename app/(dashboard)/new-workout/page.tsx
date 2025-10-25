"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReusableDialog } from "@/components/reusable-dialog";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function NewWorkout() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");

  const createRoutine = useMutation(api.routines.createRoutine);
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

  return (
    <div>
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
    </div>
  );
}
