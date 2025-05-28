'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import Masonry from 'react-masonry-css';

// Dynamically import widgets to support lazy loading
const TaskWidget = dynamic(() => import('@/components/dashboard/widgets/TaskWidget'));
const BankingWidget = dynamic(() => import('@/components/dashboard/widgets/BankingWidget'));
const WeatherWidget = dynamic(() => import('@/components/dashboard/widgets/WeatherWidget'));
const SocialWidget = dynamic(() => import('@/components/dashboard/widgets/SocialWidget'));
const FilesWidget = dynamic(() => import('@/components/dashboard/widgets/FilesWidget'));
const GmailWidget = dynamic(() => import('@/components/dashboard/widgets/GmailWidget'));
const TimelineWidget = dynamic(() => import('@/components/dashboard/widgets/TimelineWidget'));
const NewsWidget = dynamic(() => import('@/components/dashboard/widgets/NewsWidget'));
const FitnessWidget = dynamic(() => import('@/components/dashboard/widgets/FitnessWidget'));
const BlogWidget = dynamic(() => import('@/components/dashboard/widgets/BlogWidget'));

// Widget component map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const widgetComponents: { [key: string]: React.ComponentType<any> } = {
  timeline: TimelineWidget,
  tasks: TaskWidget,
  banking: BankingWidget,
  gmail: GmailWidget,
  files: FilesWidget,
  weather: WeatherWidget,
  social: SocialWidget,
  news: NewsWidget,
  fitness: FitnessWidget,
  blog: BlogWidget
};


interface WidgetPreference {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [widgetPreferences, setWidgetPreferences] = useState<WidgetPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWidgetPreferences();
    }
  }, [session]);

  const fetchWidgetPreferences = async () => {
    try {
      const response = await fetch('/api/settings/widgets');
      if (response.ok) {
        const data = await response.json();
        setWidgetPreferences(data.widgets);
      }
    } catch (error) {
      console.error('Error fetching widget preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter and sort widgets based on user preferences
  const enabledWidgets = widgetPreferences
    .filter(w => w.enabled)
    .sort((a, b) => a.position - b.position);

  // Find timeline widget if enabled
  const timelineWidget = enabledWidgets.find(w => w.id === 'timeline');
  const otherWidgets = enabledWidgets.filter(w => w.id !== 'timeline');
  
  const renderWidget = (widgetId: string) => {
    const WidgetComponent = widgetComponents[widgetId];
    if (!WidgetComponent) return null;

    // Render widget without props - they should fetch their own data
    return <WidgetComponent />;
  };

  // Masonry breakpoint columns
  const breakpointColumns = {
    default: 2,
    1536: 2,
    1280: 2,
    1024: 1,  // Tablet landscape
    768: 1,   // Tablet portrait
    640: 1    // Mobile
  };

  return (
    <div className="absolute inset-0 flex">
      {/* Timeline widget - fixed on left if enabled */}
      {timelineWidget && (
        <div className="hidden lg:flex w-1/3 xl:w-1/4 flex-shrink-0 p-6 pr-2">
          <div className="w-full">
            {renderWidget(timelineWidget.id)}
          </div>
        </div>
      )}
      
      {/* Scrollable area for other widgets */}
      <div className={`flex-1 overflow-y-auto ${timelineWidget ? 'pl-2 pr-6' : 'px-6'} py-6`}>
        {/* Mobile timeline - shows at top on mobile */}
        {timelineWidget && (
          <div className="lg:hidden mb-4">
            {renderWidget(timelineWidget.id)}
          </div>
        )}
        
        {/* Other widgets in masonry grid */}
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex gap-4 -ml-4"
          columnClassName="pl-4 space-y-4"
        >
          {otherWidgets.map((widget) => (
            <div key={widget.id}>
              {renderWidget(widget.id)}
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}