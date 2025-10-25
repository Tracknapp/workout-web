"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

export function ExerciseBrowser() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<
    string | undefined
  >();

  // Fetch all data
  const musclesData = useQuery(api.exercises.getAllMuscles);
  const equipmentsData = useQuery(api.exercises.getAllEquipments);

  // Sort alphabetically
  const muscles = musclesData
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const equipments = equipmentsData
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  // Fetch filtered exercises
  const exercises = useQuery(api.exercises.getFilteredExercises, {
    muscles: selectedMuscle ? [selectedMuscle] : undefined,
    equipments: selectedEquipment ? [selectedEquipment] : undefined,
  });

  const handleClearFilters = () => {
    setSelectedMuscle(undefined);
    setSelectedEquipment(undefined);
  };

  const hasFilters = selectedMuscle || selectedEquipment;

  return (
    <div className="flex flex-col h-full border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Equipment Dropdown */}
        <div className="p-4">
          <label className="text-sm font-semibold mb-2 block">Equipment</label>
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipments?.map((equipment) => (
                <SelectItem key={equipment._id} value={equipment.name}>
                  <span className="capitalize">{equipment.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Muscles Dropdown */}
        <div className="p-4">
          <label className="text-sm font-semibold mb-2 block">Muscles</label>
          <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select muscle" />
            </SelectTrigger>
            <SelectContent>
              {muscles?.map((muscle) => (
                <SelectItem key={muscle._id} value={muscle.name}>
                  <span className="capitalize">{muscle.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Exercises Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3">
            Exercises{" "}
            {exercises !== undefined && (
              <span className="text-muted-foreground font-normal">
                ({exercises.length})
              </span>
            )}
          </h3>

          {/* Exercises List */}
          <div className="flex flex-col gap-3">
            {exercises?.map((exercise) => (
              <div
                key={exercise._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {/* Circular GIF */}
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-muted border-2 border-border">
                  <img
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Exercise Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm capitalize truncate">
                    {exercise.name}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {exercise.targetMuscles.join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {exercises?.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No exercises found
              </div>
            )}

            {/* Loading State */}
            {exercises === undefined && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
