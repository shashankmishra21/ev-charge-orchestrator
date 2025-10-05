// apps/api/src/routes/vehicle.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateUser from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface VehicleData {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number;
  color: string | null;
  license_plate: string | null;
  battery_capacity: number;
  charging_efficiency: number;
  max_charging_power: number;
  vehicle_range: number;
  charging_curve_type: string;
  is_primary: boolean;
  created_at: Date;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Apply authentication middleware to all vehicle routes
router.use(authenticateUser);

// GET /api/vehicles - Get user's vehicles
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Authentication required'
      };
      return res.status(401).json(errorResponse);
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { user_id: req.user.id },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'desc' }
      ]
    });

    const typedVehicles: VehicleData[] = vehicles.map(vehicle => ({
      id: vehicle.id,
      user_id: vehicle.user_id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      license_plate: vehicle.license_plate,
      battery_capacity: parseFloat(vehicle.battery_capacity.toString()),
      charging_efficiency: parseFloat(vehicle.charging_efficiency.toString()),
      max_charging_power: vehicle.max_charging_power,
      vehicle_range: vehicle.vehicle_range,
      charging_curve_type: vehicle.charging_curve_type,
      is_primary: vehicle.is_primary,
      created_at: vehicle.created_at
    }));

    const response: APIResponse<VehicleData[]> = {
      success: true,
      data: typedVehicles
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to fetch vehicles'
    };
    res.status(500).json(errorResponse);
  }
});

// POST /api/vehicles - Create new vehicle
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Authentication required'
      };
      return res.status(401).json(errorResponse);
    }

    const {
      make,
      model,
      year,
      color,
      license_plate,
      battery_capacity,
      charging_efficiency,
      max_charging_power,
      vehicle_range,
      charging_curve_type,
      is_primary
    } = req.body;

    // Validation
    if (!make || !model || !year || !battery_capacity) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Make, model, year, and battery capacity are required'
      };
      return res.status(400).json(errorResponse);
    }

    // If this is set as primary, unset other primary vehicles
    if (is_primary) {
      await prisma.vehicle.updateMany({
        where: { 
          user_id: req.user.id,
          is_primary: true 
        },
        data: { is_primary: false }
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        user_id: req.user.id,
        make,
        model,
        year: parseInt(year),
        color: color || null,
        license_plate: license_plate || null,
        battery_capacity: parseFloat(battery_capacity),
        charging_efficiency: charging_efficiency ? parseFloat(charging_efficiency) : 0.90,
        max_charging_power: max_charging_power ? parseInt(max_charging_power) : 50,
        vehicle_range: vehicle_range ? parseInt(vehicle_range) : 400,
        charging_curve_type: charging_curve_type || 'standard',
        is_primary: Boolean(is_primary)
      }
    });

    const typedVehicle: VehicleData = {
      id: vehicle.id,
      user_id: vehicle.user_id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      license_plate: vehicle.license_plate,
      battery_capacity: parseFloat(vehicle.battery_capacity.toString()),
      charging_efficiency: parseFloat(vehicle.charging_efficiency.toString()),
      max_charging_power: vehicle.max_charging_power,
      vehicle_range: vehicle.vehicle_range,
      charging_curve_type: vehicle.charging_curve_type,
      is_primary: vehicle.is_primary,
      created_at: vehicle.created_at
    };

    const response: APIResponse<VehicleData> = {
      success: true,
      data: typedVehicle,
      message: 'Vehicle created successfully'
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating vehicle:', error);
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to create vehicle'
    };
    res.status(500).json(errorResponse);
  }
});

// PUT /api/vehicles/:id/primary - Set vehicle as primary
router.put('/:id/primary', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Authentication required'
      };
      return res.status(401).json(errorResponse);
    }

    const vehicleId = parseInt(req.params.id);

    if (isNaN(vehicleId)) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Invalid vehicle ID'
      };
      return res.status(400).json(errorResponse);
    }

    // Check if vehicle belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { 
        id: vehicleId,
        user_id: req.user.id 
      }
    });

    if (!existingVehicle) {
      const errorResponse: APIResponse<never> = {
        success: false,
        error: 'Vehicle not found or does not belong to user'
      };
      return res.status(404).json(errorResponse);
    }

    // Unset all primary vehicles for user
    await prisma.vehicle.updateMany({
      where: { 
        user_id: req.user.id,
        is_primary: true 
      },
      data: { is_primary: false }
    });

    // Set the specified vehicle as primary
    const vehicle = await prisma.vehicle.update({
      where: { 
        id: vehicleId
      },
      data: { is_primary: true }
    });

    const typedVehicle: VehicleData = {
      id: vehicle.id,
      user_id: vehicle.user_id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      license_plate: vehicle.license_plate,
      battery_capacity: parseFloat(vehicle.battery_capacity.toString()),
      charging_efficiency: parseFloat(vehicle.charging_efficiency.toString()),
      max_charging_power: vehicle.max_charging_power,
      vehicle_range: vehicle.vehicle_range,
      charging_curve_type: vehicle.charging_curve_type,
      is_primary: vehicle.is_primary,
      created_at: vehicle.created_at
    };

    const response: APIResponse<VehicleData> = {
      success: true,
      data: typedVehicle,
      message: 'Primary vehicle updated'
    };

    res.json(response);

  } catch (error) {
    console.error('Error setting primary vehicle:', error);
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to set primary vehicle'
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
