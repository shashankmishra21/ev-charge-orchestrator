import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    console.log('📋 Fetching bookings for user:', userId);
    
    const bookings = await prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        station: true
      },
      orderBy: { booking_time: 'desc' }
    });

    console.log('📋 Found bookings:', bookings.length);

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Create new booking (Advanced)
router.post('/create', async (req, res) => {
  try {
    const { 
      userId, 
      stationId, 
      vehicleModel, 
      currentBattery, 
      targetBattery,
      slotStartTime 
    } = req.body;

    console.log('📅 Creating advanced booking:', { 
      userId, stationId, vehicleModel, currentBattery, targetBattery 
    });

    // Validate required fields
    if (!userId || !stationId || !vehicleModel || !currentBattery || !targetBattery) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if station exists and is active
    const station = await prisma.station.findUnique({
      where: { id: parseInt(stationId) }
    });

    if (!station || !station.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Station not found or inactive'
      });
    }

    // Check available slots (count active bookings for this station)
    const activeBookings = await prisma.booking.count({
      where: {
        station_id: parseInt(stationId),
        status: { in: ['booked', 'in_progress'] }
      }
    });

    if (activeBookings >= station.total_slots) {
      return res.status(400).json({
        success: false,
        error: 'No available slots at this station'
      });
    }

    // Calculate charging duration (simplified: 2 hours for now)
    const batteryDifference = targetBattery - currentBattery;
    const predictedDuration = Math.max(60, batteryDifference * 2); // Min 60 minutes

    // Generate unique token
    const tokenNumber = `TK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Generate start/end codes
    const startCode = Math.floor(1000 + Math.random() * 9000);
    const endCode = Math.floor(1000 + Math.random() * 9000);

    // Set slot start time (default: now + 30 minutes)
    const defaultSlotStart = new Date(Date.now() + 30 * 60 * 1000);
    const slotStart = slotStartTime ? new Date(slotStartTime) : defaultSlotStart;

    // Set arrival window (30 minutes before to 15 minutes after slot start)
    const arrivalWindowStart = new Date(slotStart.getTime() - 30 * 60 * 1000);
    const arrivalWindowEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        user_id: parseInt(userId),
        station_id: parseInt(stationId),
        token_number: tokenNumber,
        slot_number: activeBookings + 1, // Next available slot
        vehicle_model: vehicleModel,
        current_battery: parseInt(currentBattery),
        target_battery: parseInt(targetBattery),
        predicted_duration: predictedDuration,
        slot_start_time: slotStart,
        arrival_window_start: arrivalWindowStart,
        arrival_window_end: arrivalWindowEnd,
        start_code: startCode,
        end_code: endCode,
        status: 'booked'
      },
      include: {
        station: true,
        user: true
      }
    });

    console.log('✅ Advanced booking created:', booking.id);

    res.json({
      success: true,
      message: 'Booking created successfully',
      booking,
      instructions: {
        token: tokenNumber,
        startCode: startCode,
        endCode: endCode,
        arrivalWindow: `${arrivalWindowStart.toLocaleTimeString()} - ${arrivalWindowEnd.toLocaleTimeString()}`,
        predictedDuration: `${predictedDuration} minutes`
      }
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

// Cancel booking
router.put('/cancel/:bookingId', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    
    console.log('❌ Cancelling booking:', bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { station: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: `Booking already ${booking.status}`
      });
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
      include: {
        station: true,
        user: true
      }
    });

    console.log('✅ Booking cancelled:', bookingId);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

// Start charging (using start code)
router.post('/start/:bookingId', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const { startCode } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { station: true }
    });

    if (!booking || booking.start_code !== parseInt(startCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking or start code'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'in_progress',
        start_code_used: true
      }
    });

    res.json({
      success: true,
      message: 'Charging started successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('❌ Start charging error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start charging'
    });
  }
});

// Get all bookings (admin)
router.get('/all', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        station: true,
        user: true
      },
      orderBy: { booking_time: 'desc' }
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Get station availability
router.get('/availability/:stationId', async (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId);
    
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Station not found'
      });
    }

    const activeBookings = await prisma.booking.count({
      where: {
        station_id: stationId,
        status: { in: ['booked', 'in_progress'] }
      }
    });

    const availableSlots = station.total_slots - activeBookings;

    res.json({
      success: true,
      station: {
        id: station.id,
        name: station.name,
        totalSlots: station.total_slots,
        activeBookings,
        availableSlots,
        isActive: station.is_active
      }
    });
  } catch (error) {
    console.error('❌ Get availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability'
    });
  }
});

export default router;
