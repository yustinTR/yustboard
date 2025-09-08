import Timeline from '@/components/organisms/timeline/Timeline';

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Timeline</h1>
        <p className="text-gray-600 dark:text-gray-400">Deel je gedachten en blijf op de hoogte van updates</p>
      </div>
      <Timeline />
    </div>
  );
}