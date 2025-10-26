"use client";

import { use, useState } from "react";
import { ExerciseBrowser } from "@/components/exercise-browser";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default function RoutineDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Workout ID: {id}</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 h-full flex flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Add Exercise</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <ExerciseBrowser />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
