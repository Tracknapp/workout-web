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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

type Period = "week" | "month" | "year" | "all";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const stats = useQuery(api.sessions.getWorkoutStats, { period });

  const chartConfig = {
    workouts: {
      label: "Workouts",
      theme: {
        light: "#22c55e", // Green for light mode
        dark: "#4ade80", // Lighter green for dark mode
      },
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === "week") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (period === "month") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "year") {
      return date.toLocaleDateString("en-US", { month: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your workout progress and statistics
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workout Activity</CardTitle>
              <CardDescription>
                Total workouts: {stats.totalWorkouts}
              </CardDescription>
            </div>
            <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {stats.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <TrendingUp className="size-12 mb-4" />
              <p className="text-lg font-medium">No workouts yet</p>
              <p className="text-sm">Start your first workout to see your progress!</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={stats.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="workouts"
                  fill="var(--color-workouts)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
