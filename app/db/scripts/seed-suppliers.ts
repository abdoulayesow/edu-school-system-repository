import { PrismaClient, ExpenseCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from app/ui/.env
dotenv.config({ path: path.resolve(__dirname, "../../ui/.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const suppliersByCategory: Record<
  ExpenseCategory,
  Array<{ name: string; phone?: string; email?: string; address?: string }>
> = {
  supplies: [
    {
      name: "Papeterie Moderne",
      phone: "+224 620 00 00 01",
      address: "Quartier Madina, Conakry",
    },
    {
      name: "Fournitures Scolaires Plus",
      phone: "+224 620 00 00 02",
      address: "Quartier Kaloum, Conakry",
    },
    {
      name: "Bureau Express",
      phone: "+224 620 00 00 03",
      address: "Quartier Ratoma, Conakry",
    },
  ],
  maintenance: [
    {
      name: "Service Technique Général",
      phone: "+224 620 00 00 04",
      address: "Conakry",
    },
    {
      name: "Réparation & Entretien",
      phone: "+224 620 00 00 05",
      address: "Conakry",
    },
    {
      name: "Plomberie Moderne",
      phone: "+224 620 00 00 06",
    },
  ],
  utilities: [
    {
      name: "EDG (Électricité de Guinée)",
      phone: "+224 30 45 00 00",
      address: "Conakry",
    },
    {
      name: "SEG (Société des Eaux de Guinée)",
      phone: "+224 30 45 00 01",
      address: "Conakry",
    },
  ],
  salary: [
    {
      name: "Paiement Salaire Personnel",
    },
    {
      name: "Avances sur Salaire",
    },
  ],
  transport: [
    {
      name: "Taxi Service",
      phone: "+224 620 00 00 07",
    },
    {
      name: "Location Véhicule",
      phone: "+224 620 00 00 08",
    },
    {
      name: "Transport Scolaire",
      phone: "+224 620 00 00 09",
    },
  ],
  communication: [
    {
      name: "Orange Guinée",
      phone: "+224 622 00 00 00",
      address: "Conakry",
    },
    {
      name: "MTN Guinée",
      phone: "+224 664 00 00 00",
      address: "Conakry",
    },
    {
      name: "Cellcom Guinée",
      phone: "+224 655 00 00 00",
      address: "Conakry",
    },
  ],
  other: [
    {
      name: "Divers",
    },
    {
      name: "Fournisseur Non Spécifié",
    },
  ],
};

async function seedSuppliers() {
  console.log("🌱 Starting supplier seeding...");

  for (const [category, suppliers] of Object.entries(suppliersByCategory)) {
    console.log(`\n📦 Seeding suppliers for category: ${category}`);

    for (const supplierData of suppliers) {
      try {
        const supplier = await prisma.supplier.upsert({
          where: {
            // Use a composite key to avoid duplicates
            id: `${category}-${supplierData.name}`, // Temporary ID for upserting
          },
          update: {
            ...supplierData,
            category: category as ExpenseCategory,
          },
          create: {
            ...supplierData,
            category: category as ExpenseCategory,
          },
        });

        console.log(`  ✓ ${supplier.name}`);
      } catch (error) {
        // If the supplier doesn't exist with that ID, create it
        const existing = await prisma.supplier.findFirst({
          where: {
            name: supplierData.name,
            category: category as ExpenseCategory,
          },
        });

        if (!existing) {
          const supplier = await prisma.supplier.create({
            data: {
              ...supplierData,
              category: category as ExpenseCategory,
            },
          });
          console.log(`  ✓ ${supplier.name} (created)`);
        } else {
          console.log(`  ⚠ ${supplierData.name} (already exists)`);
        }
      }
    }
  }

  console.log("\n✅ Supplier seeding completed!");

  // Show summary
  const totalSuppliers = await prisma.supplier.count();
  console.log(`\n📊 Total suppliers in database: ${totalSuppliers}`);
}

seedSuppliers()
  .catch((error) => {
    console.error("❌ Error seeding suppliers:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
