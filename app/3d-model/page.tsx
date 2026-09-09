import ThreeDModelGenerator from '@/components/3d-model-generator';

export const metadata = {
  title: '3D Terrain Generation | Lunaris',
  description: 'Generate 3D lunar terrain models from Chandrayaan-2 imagery.',
};

export default function ThreeDModelPage() {
  return (
    <main>
      <ThreeDModelGenerator />
    </main>
  );
}
