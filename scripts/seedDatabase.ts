import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Initialize Convex client
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  console.error("Please create a .env.local file with your Convex URL");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Read JSON files
    const dataDir = path.join(process.cwd(), "data");

    console.log("📖 Reading JSON files...");
    const bodyParts = JSON.parse(
      fs.readFileSync(path.join(dataDir, "bodyparts.json"), "utf-8")
    );
    const equipments = JSON.parse(
      fs.readFileSync(path.join(dataDir, "equipments.json"), "utf-8")
    );
    const muscles = JSON.parse(
      fs.readFileSync(path.join(dataDir, "muscles.json"), "utf-8")
    );
    const exercises = JSON.parse(
      fs.readFileSync(path.join(dataDir, "exercises.json"), "utf-8")
    );

    console.log("✓ JSON files loaded successfully\n");

    // Seed body parts
    console.log(`📥 Seeding ${bodyParts.length} body parts...`);
    const bodyPartsResult = await client.mutation(api.seed.seedBodyParts, {
      bodyParts,
    });
    console.log(`✓ ${bodyPartsResult.message}\n`);

    // Seed equipments
    console.log(`📥 Seeding ${equipments.length} equipments...`);
    const equipmentsResult = await client.mutation(api.seed.seedEquipments, {
      equipments,
    });
    console.log(`✓ ${equipmentsResult.message}\n`);

    // Seed muscles
    console.log(`📥 Seeding ${muscles.length} muscles...`);
    const musclesResult = await client.mutation(api.seed.seedMuscles, {
      muscles,
    });
    console.log(`✓ ${musclesResult.message}\n`);

    // Seed exercises in batches (to avoid payload size limits)
    const BATCH_SIZE = 100;
    const totalExercises = exercises.length;
    console.log(`📥 Seeding ${totalExercises} exercises in batches of ${BATCH_SIZE}...`);

    // Check if already seeded
    const firstBatch = exercises.slice(0, Math.min(BATCH_SIZE, exercises.length));
    const exercisesResult = await client.mutation(api.seed.seedExercises, {
      exercises: firstBatch,
    });

    if (exercisesResult.message.includes("already seeded")) {
      console.log(`✓ ${exercisesResult.message}\n`);
    } else {
      console.log(`✓ Batch 1/${Math.ceil(totalExercises / BATCH_SIZE)} seeded`);

      // Seed remaining batches
      for (let i = BATCH_SIZE; i < totalExercises; i += BATCH_SIZE) {
        const batch = exercises.slice(i, i + BATCH_SIZE);
        await client.mutation(api.seed.seedExercises, {
          exercises: batch,
        });
        const batchNumber = Math.ceil((i + 1) / BATCH_SIZE);
        const totalBatches = Math.ceil(totalExercises / BATCH_SIZE);
        console.log(`✓ Batch ${batchNumber}/${totalBatches} seeded`);
      }
      console.log(`\n✓ All ${totalExercises} exercises seeded successfully\n`);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`  - Body Parts: ${bodyParts.length}`);
    console.log(`  - Equipments: ${equipments.length}`);
    console.log(`  - Muscles: ${muscles.length}`);
    console.log(`  - Exercises: ${totalExercises}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
