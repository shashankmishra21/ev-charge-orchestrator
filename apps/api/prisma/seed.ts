const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI-ready database...');

  // Enhanced Stations with AI fields
  const stations = await Promise.all([
    prisma.station.create({
      data: {
        name: "Connaught Place EV Hub",
        address: "Block A, Connaught Place, New Delhi",
        latitude: 28.6315,
        longitude: 77.2167,
        city: "Delhi",
        total_slots: 4,
        price_per_kwh: 12.50,
        charging_power: 50,
        charger_type: "CCS",
        efficiency_rating: 0.95,
        amenities: ["WiFi", "Cafe", "Parking", "24/7"]
      }
    }),
    prisma.station.create({
      data: {
        name: "Cyber City Fast Charge",
        address: "DLF Cyber City, Sector 25, Gurgaon",
        latitude: 28.4949,
        longitude: 77.0853,
        city: "Gurgaon",
        total_slots: 6,
        price_per_kwh: 15.00,
        charging_power: 75,
        charger_type: "CCS",
        efficiency_rating: 0.92,
        amenities: ["Restroom", "Food Court", "ATM"]
      }
    }),
    prisma.station.create({
      data: {
        name: "Select City Mall Station",
        address: "Select City Walk, Saket, Delhi",
        latitude: 28.5244,
        longitude: 77.2066,
        city: "Delhi",
        total_slots: 3,
        price_per_kwh: 10.00,
        charging_power: 25,
        charger_type: "Type2",
        efficiency_rating: 0.88,
        amenities: ["WiFi", "Shopping", "Movies"]
      }
    }),
    prisma.station.create({
      data: {
        name: "ISBT Power Point",
        address: "ISBT Kashmere Gate, Delhi",
        latitude: 28.6692,
        longitude: 77.2265,
        city: "Delhi",
        total_slots: 2,
        price_per_kwh: 14.00,
        charging_power: 60,
        charger_type: "CHAdeMO",
        efficiency_rating: 0.90,
        amenities: ["24/7", "Security", "Bus Terminal"]
      }
    }),
    prisma.station.create({
      data: {
        name: "Airport Express Charge",
        address: "Terminal 3, IGI Airport, Delhi",
        latitude: 28.5562,
        longitude: 77.0999,
        city: "Delhi",
        total_slots: 8,
        price_per_kwh: 18.00,
        charging_power: 100,
        charger_type: "CCS",
        efficiency_rating: 0.96,
        amenities: ["Premium", "Valet", "Airport", "Fast"]
      }
    })
  ]);

  // Sample Vehicle Types for Reference
  console.log('📱 Sample vehicle efficiency data:');
  const vehicleData = {
    'Tesla Model 3': { efficiency: 0.92, max_power: 170, range: 500, curve: 'fast' },
    'Tata Nexon EV': { efficiency: 0.85, max_power: 50, range: 312, curve: 'standard' },
    'MG ZS EV': { efficiency: 0.88, max_power: 50, range: 419, curve: 'standard' },
    'Hyundai Kona': { efficiency: 0.89, max_power: 77, range: 452, curve: 'fast' },
    'BMW iX': { efficiency: 0.90, max_power: 150, range: 630, curve: 'fast' }
  };

  // Create sample utilization data for AI training
  const today = new Date();
  for (let stationIndex = 0; stationIndex < stations.length; stationIndex++) {
    for (let dayOffset = -30; dayOffset <= 0; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      
      for (let hour = 0; hour < 24; hour++) {
        // Simulate realistic utilization patterns
        let utilization = 0.3; // Base utilization
        
        // Peak hours (higher utilization)
        if (hour >= 17 && hour <= 21) utilization = 0.8;
        else if (hour >= 8 && hour <= 10) utilization = 0.6;
        else if (hour >= 22 || hour <= 6) utilization = 0.2;
        
        // Add some randomness
        utilization += (Math.random() - 0.5) * 0.3;
        utilization = Math.max(0, Math.min(1, utilization));
        
        await prisma.stationUtilization.create({
          data: {
            station_id: stations[stationIndex].id,
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            hour: hour,
            utilization: utilization,
            avg_wait_time: Math.round(utilization * 20), // Max 20 min wait
            total_sessions: Math.round(utilization * stations[stationIndex].total_slots)
          }
        });
      }
    }
  }

  console.log('✅ Database seeded with AI-ready data!');
  console.log(`📊 Created ${stations.length} stations`);
  console.log(`📈 Created ${stations.length * 31 * 24} utilization records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
