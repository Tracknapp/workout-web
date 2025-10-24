import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed body parts
export const seedBodyParts = mutation({
  args: {
    bodyParts: v.array(v.object({ name: v.string() })),
  },
  handler: async (ctx, args) => {
    const count = await ctx.db.query("bodyParts").collect();

    if (count.length > 0) {
      console.log(`Body parts already seeded (${count.length} records)`);
      return { message: "Body parts already seeded", count: count.length };
    }

    for (const bodyPart of args.bodyParts) {
      await ctx.db.insert("bodyParts", bodyPart);
    }

    return { message: "Body parts seeded successfully", count: args.bodyParts.length };
  },
});

// Seed equipments
export const seedEquipments = mutation({
  args: {
    equipments: v.array(v.object({ name: v.string() })),
  },
  handler: async (ctx, args) => {
    const count = await ctx.db.query("equipments").collect();

    if (count.length > 0) {
      console.log(`Equipments already seeded (${count.length} records)`);
      return { message: "Equipments already seeded", count: count.length };
    }

    for (const equipment of args.equipments) {
      await ctx.db.insert("equipments", equipment);
    }

    return { message: "Equipments seeded successfully", count: args.equipments.length };
  },
});

// Seed muscles
export const seedMuscles = mutation({
  args: {
    muscles: v.array(v.object({ name: v.string() })),
  },
  handler: async (ctx, args) => {
    const count = await ctx.db.query("muscles").collect();

    if (count.length > 0) {
      console.log(`Muscles already seeded (${count.length} records)`);
      return { message: "Muscles already seeded", count: count.length };
    }

    for (const muscle of args.muscles) {
      await ctx.db.insert("muscles", muscle);
    }

    return { message: "Muscles seeded successfully", count: args.muscles.length };
  },
});

// Seed exercises (batch insert)
export const seedExercises = mutation({
  args: {
    exercises: v.array(
      v.object({
        exerciseId: v.string(),
        name: v.string(),
        gifUrl: v.string(),
        targetMuscles: v.array(v.string()),
        bodyParts: v.array(v.string()),
        equipments: v.array(v.string()),
        secondaryMuscles: v.array(v.string()),
        instructions: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = await ctx.db.query("exercises").collect();

    if (count.length > 0) {
      console.log(`Exercises already seeded (${count.length} records)`);
      return { message: "Exercises already seeded", count: count.length };
    }

    for (const exercise of args.exercises) {
      await ctx.db.insert("exercises", exercise);
    }

    return { message: "Exercises seeded successfully", count: args.exercises.length };
  },
});

// Clear all data (useful for re-seeding)
export const clearAllData = mutation({
  handler: async (ctx) => {
    const bodyParts = await ctx.db.query("bodyParts").collect();
    const equipments = await ctx.db.query("equipments").collect();
    const muscles = await ctx.db.query("muscles").collect();
    const exercises = await ctx.db.query("exercises").collect();

    for (const item of bodyParts) {
      await ctx.db.delete(item._id);
    }
    for (const item of equipments) {
      await ctx.db.delete(item._id);
    }
    for (const item of muscles) {
      await ctx.db.delete(item._id);
    }
    for (const item of exercises) {
      await ctx.db.delete(item._id);
    }

    return {
      message: "All data cleared successfully",
      counts: {
        bodyParts: bodyParts.length,
        equipments: equipments.length,
        muscles: muscles.length,
        exercises: exercises.length,
      },
    };
  },
});
