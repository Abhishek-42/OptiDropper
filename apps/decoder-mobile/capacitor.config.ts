import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.optidropper.app',
  appName: 'Optidropper',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
