// apps/web/src/app/lib/utils.ts
export function calculateDistance(
  userLoc: { latitude: number; longitude: number },
  station: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (station.latitude - userLoc.latitude) * Math.PI / 180;
  const dLon = (station.longitude - userLoc.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(userLoc.latitude * Math.PI / 180) * 
           Math.cos(station.latitude * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}
