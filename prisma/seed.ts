import dotenv from "dotenv";
import path from "path";

// Load environment variables manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

// Connection string with database fallback
const connectionString = process.env.DATABASE_URL!;

const cleanConnectionString = connectionString
  .replace("&sslrootcert=system", "")
  .replace("?sslrootcert=system", "");

const pool = new Pool({
  connectionString: cleanConnectionString,
  ssl: connectionString.includes("sslmode=") || connectionString.includes("sslrootcert=")
    ? { rejectUnauthorized: false }
    : undefined
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  await prisma.$disconnect();
  await pool.end();
  console.log("Seeding completed successfully.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
