import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'socious.wallet.app',
  appName: 'Socious Wallet',
  webDir: 'build',
  server: {
    hostname: 'wallet.socious.io',
    androidScheme: 'https',
    iosScheme: 'https',
    // url: 'https://wallet.socious.io',
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
