import { CapacitorConfig } from '@capacitor/cli';
import { Capacitor } from '@capacitor/core';

function defineHostname() {
  return Capacitor.getPlatform() === 'ios' ? 'wallet.socious.io' : 'capacitor.native';
}

const config: CapacitorConfig = {
  appId: 'socious.wallet.app',
  appName: 'Socious Wallet',
  webDir: 'build',
  server: {
    hostname: defineHostname(),
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
