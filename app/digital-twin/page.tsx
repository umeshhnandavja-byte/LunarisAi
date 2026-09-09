import DigitalTwinDashboard from '@/components/digital-twin-dashboard';

export const metadata = {
  title: 'Lunar Digital Twin | Lunaris',
  description: 'Interactive 3D Lunar Digital Twin for Chandrayaan-2 image analysis',
};

export default function DigitalTwinPage() {
  return (
    <main className="w-full h-screen">
      <DigitalTwinDashboard />
    </main>
  );
}
