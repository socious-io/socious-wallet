import { datadogRum } from '@datadog/browser-rum';
import { config, APP_VERSION } from 'src/config';

export const enabled = config.DATADOG_APP_ID && config.DATADOG_CLIENT_TOKEN;

export function init() {
  if (!enabled) return;
  datadogRum.init({
    applicationId: config.DATADOG_APP_ID,
    clientToken: config.DATADOG_CLIENT_TOKEN,
    site: 'ap1.datadoghq.com',
    service: `wallet-${config.PLATFORM}`,
    env: config.ENV,
    version: APP_VERSION,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  datadogRum.startSessionReplayRecording();

  window.addEventListener('error', (event: ErrorEvent) => {
    datadogRum.addError(event.error);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    datadogRum.addError(event.reason);
  });
}

export function addAction(name: string, context?: object) {
  if (!enabled) return;
  datadogRum.addAction(name, context);
}

export function setUser(user: { id: string; email: string; name: string }) {
  if (!enabled) return;
  datadogRum.setUser(user);
}

export function addError(error: unknown, context?: object) {
  if (!enabled) return;
  datadogRum.addError(error, context);
}

export function addTiming(name: string, time?: number) {
  if (!enabled) return;
  datadogRum.addTiming(name, time);
}
