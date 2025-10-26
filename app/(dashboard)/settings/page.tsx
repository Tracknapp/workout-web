"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const userIdentity = useQuery(api.user.getUser);
  const userProfile = useQuery(api.user.getUserProfile);
  const updatePreferences = useMutation(api.user.updateUserPreferences);
  const { theme, setTheme } = useTheme();

  const [gender, setGender] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kgs">("lbs");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form values when user profile loads
  useEffect(() => {
    if (userProfile) {
      setGender(userProfile.gender || "");
      setWeightUnit(userProfile.weightUnit || "lbs");
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePreferences({
        gender: gender || undefined,
        weightUnit,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!userProfile) return false;
    return (
      gender !== (userProfile.gender || "") ||
      weightUnit !== (userProfile.weightUnit || "lbs")
    );
  };

  if (!userIdentity || !userProfile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Information (Read-only) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <p className="text-sm text-muted-foreground">
              Your name and email are managed by Google
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-muted/30">
            <Avatar className="size-24">
              <AvatarImage src={userIdentity.pictureUrl} alt={userIdentity.name || "User"} />
              <AvatarFallback>
                <User className="size-12" />
              </AvatarFallback>
            </Avatar>

            <div className="w-full space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm font-medium">
                  {userProfile.firstName && userProfile.lastName
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : userIdentity.name || "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium break-all">{userProfile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preferences (Editable) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Customize your workout tracking experience
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="size-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="size-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightUnit">Preferred Weight Unit</Label>
              <Select value={weightUnit} onValueChange={(value: "lbs" | "kgs") => setWeightUnit(value)}>
                <SelectTrigger id="weightUnit" className="w-full">
                  <SelectValue placeholder="Select weight unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  <SelectItem value="kgs">Kilograms (kgs)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be used for all weight inputs in your workouts
              </p>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || isSaving}
                className="gap-2 w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
