import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create 5 sample stations
  const stations = await Promise.all([
    prisma.station.create({
      data: {
        name: 'Mall Complex Station',
        address: 'City Mall, Sector 12, Main Road',
        total_slots: 5,
        price_per_kwh: 8.00
      }
    }),
    prisma.station.create({
      data: {
        name: 'IT Park Station',
        address: 'Tech Park, Phase 1, IT Corridor',
        total_slots: 5,
        price_per_kwh: 7.50
      }
    }),
    prisma.station.create({
      data: {
        name: 'Highway Plaza Station',
        address: 'Highway Plaza, NH-44, Exit 15',
        total_slots: 5,
        price_per_kwh: 9.00
      }
    }),
    prisma.station.create({
      data: {
        name: 'Residential Hub Station',
        address: 'Green Valley Society, Block A',
        total_slots: 5,
        price_per_kwh: 7.00
      }
    }),
    prisma.station.create({
      data: {
        name: 'Airport Station',
        address: 'International Airport, Terminal 2',
        total_slots: 5,
        price_per_kwh: 10.00
      }
    })
  ]);

  console.log(`Created ${stations.length} stations`);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
