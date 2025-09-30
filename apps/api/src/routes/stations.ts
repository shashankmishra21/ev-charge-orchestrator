import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all stations with availability
router.get('/', async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        bookings: {
          where: {
            status: {
              in: ['booked', 'charging']
            }
          }
        }
      }
    });

    // Calculate available slots
    const stationsWithAvailability = stations.map(station => ({
      ...station,
      available_slots: station.total_slots - station.bookings.length,
      bookings: undefined // Remove bookings from response
    }));

    res.json({
      success: true,
      stations: stationsWithAvailability
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stations'
    });
  }
});

export default router;
