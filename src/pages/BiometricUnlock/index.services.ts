import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const BIOMETRIC_KEY = 'biometricUnlock';
const SECURE_KEY = 'userData'; // e.g., { userId: string, token: string }

// Check if biometrics are available/enrolled
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch (error) {
    console.error('Biometry check failed:', error);
    return false;
  }
};

// Enable biometrics after manual login (store flag + data)
export const enableBiometrics = async (userData: { userId: string; token: string }): Promise<void> => {
  if (!(await isBiometricAvailable())) {
    throw new Error('Biometrics not available');
  }

  // Authenticate to "seal" the storage
  await BiometricAuth.authenticate({
    reason: 'Enable biometric unlock',
  });

  // Store encrypted data
  await SecureStorage.setItem(SECURE_KEY, JSON.stringify(userData));

  // Store simple flag in localStorage (for quick checks; data is in secure storage)
  localStorage.setItem(BIOMETRIC_KEY, 'enabled');
};

// Unlock: Verify biometrics, then retrieve data
export const unlockWithBiometrics = async (): Promise<{ userId: string; token: string } | null> => {
  const enabled = localStorage.getItem(BIOMETRIC_KEY);
  if (!enabled) {
    return null; // Biometrics not enabled
  }

  if (!(await isBiometricAvailable())) {
    return null;
  }

  try {
    // Prompt biometrics to unlock
    await BiometricAuth.authenticate({
      reason: 'Unlock app',
      allowDeviceCredential: true,
    });

    // Retrieve from secure storage (unlocked by biometrics via Keychain/Keystore)
    const value = await SecureStorage.getItem(SECURE_KEY);
    if (!value) return null;

    return JSON.parse(value);
  } catch (error) {
    if ((error as any).code === 'CANCELED') {
      // User canceled - silent handling
    } else {
      console.error('Unlock failed:', error);
    }
    return null;
  }
};

// Disable biometrics
export const disableBiometrics = async (): Promise<void> => {
  localStorage.removeItem(BIOMETRIC_KEY);
  await SecureStorage.removeItem(SECURE_KEY);
};
