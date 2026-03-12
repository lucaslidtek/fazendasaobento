import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "admin@fazendas.bento")).limit(1);
  if (!existing[0]) {
    await db.insert(usersTable).values({
      name: "Administrador",
      email: "admin@fazendas.bento",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
    });
    console.log("✅ Admin user created: admin@fazendas.bento / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
