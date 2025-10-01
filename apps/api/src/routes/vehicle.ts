import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all vehicle routes
router.use(authenticateUser);

// GET /api/vehicles - Get user's vehicles
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id; // Now guaranteed to exist due to middleware
    
    console.log('Fetching vehicles for user:', userId);
    
    const vehicles = await prisma.vehicle.findMany({
      where: { user_id: userId },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'desc' }
      ]
    });

    console.log(`✅ Found ${vehicles.length} vehicles for user ${userId}`);

    res.json({
      success: true,
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.license_plate,
        batteryCapacity: parseFloat(vehicle.battery_capacity.toString()),
        isPrimary: vehicle.is_primary,
        createdAt: vehicle.created_at
      }))
    });
  } catch (error) {
    console.error('💥 Failed to fetch vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
});

// POST /api/vehicles - Add new vehicle
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { make, model, year, color, licensePlate, batteryCapacity, isPrimary } = req.body;

    console.log('🚗 Creating new vehicle for user:', userId, { make, model, year });

    // Validation
    if (!make || !model || !year || !batteryCapacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: make, model, year, batteryCapacity'
      });
    }

    // If this is set as primary, unset other primary vehicles
    if (isPrimary) {
      await prisma.vehicle.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false }
      });
      console.log('🔄 Unset previous primary vehicles');
    }

    // Check if this is user's first vehicle, make it primary automatically
    const existingVehiclesCount = await prisma.vehicle.count({
      where: { user_id: userId }
    });
    
    const isFirstVehicle = existingVehiclesCount === 0;
    
    if (isFirstVehicle) {
      console.log('🌟 First vehicle - setting as primary automatically');
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        user_id: userId,
        make,
        model,
        year: parseInt(year),
        color: color || null,
        license_plate: licensePlate || null,
        battery_capacity: parseFloat(batteryCapacity),
        is_primary: isPrimary || isFirstVehicle
      }
    });

    console.log('✅ Vehicle created successfully:', vehicle.id);

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.license_plate,
        batteryCapacity: parseFloat(vehicle.battery_capacity.toString()),
        isPrimary: vehicle.is_primary
      }
    });
  } catch (error) {
    console.error('💥 Failed to create vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create vehicle'
    });
  }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const vehicleId = parseInt(req.params.id);
    const { make, model, year, color, licensePlate, batteryCapacity, isPrimary } = req.body;

    console.log('✏️ Updating vehicle:', vehicleId, 'for user:', userId);

    // Check if vehicle belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, user_id: userId }
    });

    if (!existingVehicle) {
      console.log('❌ Vehicle not found or does not belong to user');
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // If setting as primary, unset other primary vehicles
    if (isPrimary) {
      await prisma.vehicle.updateMany({
        where: { user_id: userId, is_primary: true, id: { not: vehicleId } },
        data: { is_primary: false }
      });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        make: make || existingVehicle.make,
        model: model || existingVehicle.model,
        year: year ? parseInt(year) : existingVehicle.year,
        color: color !== undefined ? color : existingVehicle.color,
        license_plate: licensePlate !== undefined ? licensePlate : existingVehicle.license_plate,
        battery_capacity: batteryCapacity ? parseFloat(batteryCapacity) : existingVehicle.battery_capacity,
        is_primary: isPrimary !== undefined ? isPrimary : existingVehicle.is_primary
      }
    });

    console.log('✅ Vehicle updated successfully:', updatedVehicle.id);

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: {
        id: updatedVehicle.id,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        color: updatedVehicle.color,
        licensePlate: updatedVehicle.license_plate,
        batteryCapacity: parseFloat(updatedVehicle.battery_capacity.toString()),
        isPrimary: updatedVehicle.is_primary
      }
    });
  } catch (error) {
    console.error('💥 Failed to update vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update vehicle'
    });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const vehicleId = parseInt(req.params.id);

    console.log('🗑️ Deleting vehicle:', vehicleId, 'for user:', userId);

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, user_id: userId }
    });

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check if this vehicle has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicle_id: vehicleId,
        status: { in: ['booked', 'in_progress'] }
      }
    });

    if (activeBookings > 0) {
      console.log('❌ Cannot delete vehicle with active bookings');
      return res.status(400).json({
        success: false,
        error: 'Cannot delete vehicle with active bookings'
      });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    // If this was the primary vehicle, set another one as primary
    if (existingVehicle.is_primary) {
      const nextVehicle = await prisma.vehicle.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });

      if (nextVehicle) {
        await prisma.vehicle.update({
          where: { id: nextVehicle.id },
          data: { is_primary: true }
        });
        console.log('🔄 Set new primary vehicle:', nextVehicle.id);
      }
    }

    console.log('✅ Vehicle deleted successfully');

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('💥 Failed to delete vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
});

// PUT /api/vehicles/:id/primary - Set as primary vehicle
router.put('/:id/primary', async (req, res) => {
  try {
    const userId = req.user!.id;
    const vehicleId = parseInt(req.params.id);

    console.log('⭐ Setting primary vehicle:', vehicleId, 'for user:', userId);

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, user_id: userId }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Unset all other primary vehicles for this user
    await prisma.vehicle.updateMany({
      where: { user_id: userId },
      data: { is_primary: false }
    });

    // Set this vehicle as primary
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { is_primary: true }
    });

    console.log('✅ Primary vehicle set successfully');

    res.json({
      success: true,
      message: 'Primary vehicle updated'
    });
  } catch (error) {
    console.error('💥 Failed to set primary vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set primary vehicle'
    });
  }
});

export default router;
