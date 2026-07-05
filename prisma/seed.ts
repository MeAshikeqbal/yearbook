import dotenv from "dotenv";
import path from "path";

// Load environment variables manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin account
  const adminEmail = "admin@college.edu";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        status: "APPROVED",
        studentProfile: {
          create: {
            username: "admin",
            name: "Admin User",
            role: "Yearbook Admin / System Moderator",
            bio: "Yearbook system administrator profile.",
            avatarUrl: "https://placehold.co/150",
            stats: {
              adminPower: 9999
            }
          }
        }
      },
    });
    console.log(`✅ Admin account created:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: admin123`);
  } else {
    console.log("ℹ️ Admin account already exists.");
  }

  // Create a pending student for testing
  const studentEmail = "student@college.edu";
  const existingStudent = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!existingStudent) {
    const hashedPassword = await bcrypt.hash("student123", 10);
    await prisma.user.create({
      data: {
        email: studentEmail,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING",
        studentProfile: {
          create: {
            username: "student",
            name: "Pending Student",
            role: "CSE Student",
            bio: "Excited to graduate! Just pending admin verification.",
            avatarUrl: "https://placehold.co/150",
            stats: {
              bugsFixed: 12,
              coffeeConsumed: 64
            }
          }
        }
      },
    });
    console.log(`✅ Test pending student created:`);
    console.log(`   Email: ${studentEmail}`);
    console.log(`   Password: student123`);
  }

  // Create default feature flags
  const defaultFlags = [
    { key: "FLIPBOOK", value: true, description: "Physical flipbook yearbook spread viewer" },
    { key: "MEMORIES", value: true, description: "Class snapshot mosaic grid and memory uploads" },
    { key: "BUGS", value: true, description: "Class issue and bug reporting board" },
    { key: "BROWSE", value: true, description: "Browse and search student profiles" },
    { key: "REGISTRATION", value: true, description: "New student account registrations and signups" },
    { key: "PROFILE_EDITING", value: true, description: "Customizing individual profiles, bios, custom CSS and stats" },
  ];

  console.log("Seeding default feature flags...");
  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {}, // do not overwrite value if already exists
      create: flag,
    });
  }
  console.log("✅ Seeding feature flags completed.");

  await prisma.$disconnect();
  console.log("Seeding completed successfully.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
