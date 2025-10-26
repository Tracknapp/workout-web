"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "./search-bar";
import { FilterDropdown } from "./filter-dropdown";
import { ExerciseList } from "./exercise-list";
import { PAGE_SIZE, type Exercise } from "./types";

export function ExerciseBrowser() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [muscleOpen, setMuscleOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isDone, setIsDone] = useState(false);

  // Fetch all data
  const musclesData = useQuery(api.exercises.getAllMuscles);
  const equipmentsData = useQuery(api.exercises.getAllEquipments);

  // Sort alphabetically and memoize
  const muscles = useMemo(
    () => musclesData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [musclesData]
  );
  const equipments = useMemo(
    () => equipmentsData?.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [equipmentsData]
  );

  // Fetch filtered exercises with offset-based pagination
  const exercisesData = useQuery(api.exercises.getFilteredExercises, {
    muscles: selectedMuscle !== "all" ? [selectedMuscle] : undefined,
    equipments: selectedEquipment !== "all" ? [selectedEquipment] : undefined,
    search: searchQuery.trim().length > 0 ? searchQuery : undefined,
    limit: PAGE_SIZE,
    offset: offset,
  });

  // Handle data updates
  useEffect(() => {
    if (!exercisesData) return;

    if (offset === 0) {
      // Initial load or filter changed
      setAllExercises(exercisesData.exercises);
    } else {
      // Loading more - append to existing
      if (exercisesData.exercises.length > 0) {
        setAllExercises((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((e) => e._id));
          const newExercises = exercisesData.exercises.filter(
            (e) => !existingIds.has(e._id)
          );
          return [...prev, ...newExercises];
        });
      }
    }

    setIsDone(exercisesData.isDone);
    setIsLoadingMore(false);
  }, [exercisesData, offset]);

  const resetFilters = () => {
    setAllExercises([]);
    setOffset(0);
    setIsDone(false);
    setIsLoadingMore(false);
  };

  const handleClearFilters = () => {
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSearchQuery("");
    resetFilters();
  };

  const hasFilters =
    selectedMuscle !== "all" ||
    selectedEquipment !== "all" ||
    searchQuery.trim().length > 0;

  const handleMuscleChange = (value: string) => {
    setSelectedMuscle(value);
    resetFilters();
  };

  const handleEquipmentChange = (value: string) => {
    setSelectedEquipment(value);
    resetFilters();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetFilters();
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setOffset((prev) => prev + PAGE_SIZE);
  };

  return (
    <div className="flex flex-col h-full border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Exercise Library</h2>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        hasFilters={hasFilters}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      <Separator />

      {/* Equipment Filter */}
      <FilterDropdown
        label="Equipment"
        placeholder="Search equipment..."
        emptyMessage="No equipment found."
        options={equipments}
        selectedValue={selectedEquipment}
        isOpen={equipmentOpen}
        onToggle={() => setEquipmentOpen(!equipmentOpen)}
        onSelect={handleEquipmentChange}
        onClose={() => setEquipmentOpen(false)}
      />

      <Separator />

      {/* Muscle Filter */}
      <FilterDropdown
        label="Muscles"
        placeholder="Search muscles..."
        emptyMessage="No muscle found."
        options={muscles}
        selectedValue={selectedMuscle}
        isOpen={muscleOpen}
        onToggle={() => setMuscleOpen(!muscleOpen)}
        onSelect={handleMuscleChange}
        onClose={() => setMuscleOpen(false)}
      />

      <Separator />

      {/* Exercise List */}
      <ExerciseList
        exercises={allExercises}
        isLoading={!exercisesData}
        isLoadingMore={isLoadingMore}
        isDone={isDone}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
