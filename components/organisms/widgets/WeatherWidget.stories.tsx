import type { Meta, StoryObj } from '@storybook/nextjs';
import { WeatherWidget } from './WeatherWidget';

const meta = {
  title: 'Dashboard/Widgets/WeatherWidget',
  component: WeatherWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WeatherWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the fetch API for Storybook
const mockWeatherData = {
  temperature: 22,
  condition: 'clear',
  description: 'Clear sky',
  location: 'Amsterdam, NL',
  feels_like: 20,
  humidity: 65,
  wind_speed: 12,
  forecast: [
    { day: 'Mon', temperature: 23, condition: 'clear' },
    { day: 'Tue', temperature: 21, condition: 'cloudy' },
    { day: 'Wed', temperature: 19, condition: 'rainy' },
    { day: 'Thu', temperature: 20, condition: 'clear' },
    { day: 'Fri', temperature: 22, condition: 'cloudy' },
  ],
};

export const Default: Story = {
  decorators: [
    (Story) => {
      // Mock geolocation
      if (typeof window !== 'undefined') {
        Object.defineProperty(window.navigator, 'geolocation', {
          value: {
            getCurrentPosition: (success: PositionCallback) => {
              success({
                coords: {
                  latitude: 52.3676,
                  longitude: 4.9041,
                  accuracy: 100,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: Date.now(),
              } as GeolocationPosition);
            },
            watchPosition: () => 0,
            clearWatch: () => {},
          },
          writable: true,
          configurable: true,
        });
      }

      // Mock fetch
      global.fetch = ((() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeatherData),
        } as Response)
      )) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      // Mock a delayed response to show loading state
      global.fetch = ((() =>
        new Promise(() => {})
      )) as typeof globalThis.fetch;

      return <Story />;
    },
  ],
};

export const Error: Story = {
  decorators: [
    (Story) => {
      // Mock geolocation error
      if (typeof window !== 'undefined') {
        Object.defineProperty(window.navigator, 'geolocation', {
          value: {
            getCurrentPosition: (_: PositionCallback, error?: PositionErrorCallback) => {
              if (error) {
                error({
                  code: 1,
                  message: 'User denied Geolocation',
                  PERMISSION_DENIED: 1,
                  POSITION_UNAVAILABLE: 2,
                  TIMEOUT: 3,
                } as GeolocationPositionError);
              }
            },
            watchPosition: () => 0,
            clearWatch: () => {},
          },
          writable: true,
          configurable: true,
        });
      }

      return <Story />;
    },
  ],
};