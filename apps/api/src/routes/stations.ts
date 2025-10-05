// apps/api/src/routes/stations.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Types for responses
interface StationWithAI {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  total_slots: number;
  price_per_kwh: number;
  charging_power: number;
  charger_type: string;
  efficiency_rating: number;
  amenities: string[];
  is_active: boolean;
  created_at: Date;
  current_utilization: number;
  estimated_wait: string;
  availability_status: 'Available' | 'Moderate' | 'Busy';
  ai_recommendation: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// GET /api/stations - Get all stations with AI insights
router.get('/', async (req: Request, res: Response) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        utilization_logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          orderBy: {
            hour: 'desc'
          },
          take: 1
        }
      }
    });

    const stationsWithAI: StationWithAI[] = stations.map(station => {
      const currentHour = new Date().getHours();
      const utilization = station.utilization_logs[0]?.utilization 
        ? parseFloat(station.utilization_logs[0].utilization.toString()) 
        : 0.3;
      
      return {
        id: station.id,
        name: station.name,
        address: station.address,
        latitude: parseFloat(station.latitude.toString()),
        longitude: parseFloat(station.longitude.toString()),
        city: station.city,
        total_slots: station.total_slots,
        price_per_kwh: parseFloat(station.price_per_kwh.toString()),
        charging_power: station.charging_power,
        charger_type: station.charger_type,
        efficiency_rating: parseFloat(station.efficiency_rating.toString()),
        amenities: station.amenities,
        is_active: station.is_active,
        created_at: station.created_at,
        current_utilization: Math.round(utilization * 100),
        estimated_wait: calculateWaitTime(utilization),
        availability_status: getAvailabilityStatus(utilization),
        ai_recommendation: getAIRecommendation(station, currentHour)
      };
    });

    const response: APIResponse<StationWithAI[]> = {
      success: true,
      data: stationsWithAI
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching stations:', error);
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to fetch stations'
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/stations/:id - Get single station
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stationId = parseInt(id);

    if (isNaN(stationId)) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Invalid station ID'
      };
      return res.status(400).json(errorResponse);
    }

    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: {
        utilization_logs: {
          where: {
            date: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: [
            { date: 'desc' },
            { hour: 'desc' }
          ]
        }
      }
    });

    if (!station) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Station not found'
      };
      return res.status(404).json(errorResponse);
    }

    const currentHour = new Date().getHours();
    const utilization = station.utilization_logs[0]?.utilization 
      ? parseFloat(station.utilization_logs[0].utilization.toString()) 
      : 0.3;

    const stationWithAI: StationWithAI = {
      id: station.id,
      name: station.name,
      address: station.address,
      latitude: parseFloat(station.latitude.toString()),
      longitude: parseFloat(station.longitude.toString()),
      city: station.city,
      total_slots: station.total_slots,
      price_per_kwh: parseFloat(station.price_per_kwh.toString()),
      charging_power: station.charging_power,
      charger_type: station.charger_type,
      efficiency_rating: parseFloat(station.efficiency_rating.toString()),
      amenities: station.amenities,
      is_active: station.is_active,
      created_at: station.created_at,
      current_utilization: Math.round(utilization * 100),
      estimated_wait: calculateWaitTime(utilization),
      availability_status: getAvailabilityStatus(utilization),
      ai_recommendation: getAIRecommendation(station, currentHour)
    };

    const response: APIResponse<StationWithAI> = {
      success: true,
      data: stationWithAI
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching station:', error);
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to fetch station'
    };
    res.status(500).json(errorResponse);
  }
});

// Helper Functions
function calculateWaitTime(utilization: number): string {
  if (utilization < 0.3) return 'No wait';
  if (utilization < 0.6) return '5-10 mins';
  if (utilization < 0.8) return '10-15 mins';
  return '15+ mins';
}

function getAvailabilityStatus(utilization: number): 'Available' | 'Moderate' | 'Busy' {
  if (utilization < 0.5) return 'Available';
  if (utilization < 0.8) return 'Moderate';
  return 'Busy';
}

function getAIRecommendation(station: any, currentHour: number): string {
  const efficiency = parseFloat(station.efficiency_rating.toString());
  
  if (currentHour >= 18 && currentHour <= 21) {
    return `Peak hours - Consider charging after 9 PM for 20% savings`;
  }
  
  if (currentHour >= 22 || currentHour <= 6) {
    return `Perfect time! Off-peak rates - Save up to 30%`;
  }
  
  return `Good efficiency (${Math.round(efficiency * 100)}%) - Expected fast charging`;
}

export default router;
