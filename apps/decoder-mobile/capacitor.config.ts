import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 's2c.decoder.app',
  appName: 'S2C Decoder',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
