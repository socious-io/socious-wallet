import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'socious.wallet.app',
  appName: 'socious-wallet',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
