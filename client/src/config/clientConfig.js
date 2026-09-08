const mode = import.meta.env.MODE;
const isProd = mode === 'production';

function readEnv(name, { requiredInProduction = false, devFallback = '' } = {}) {
  const value = import.meta.env[name];

  if (value !== undefined && value !== null && String(value).trim() !== '') {
    return String(value);
  }

  if (requiredInProduction && isProd) {
    throw new Error(`[config] ${name} is required in production builds`);
  }

  return devFallback;
}

export const clientConfig = Object.freeze({
  mode,
  isProd,
  appName: readEnv('VITE_APP_NAME', { devFallback: 'ArchiveX' }),
  apiBaseUrl: readEnv('VITE_API_BASE_URL', {
    requiredInProduction: true,
    devFallback: 'http://localhost:5001/api/v1',
  }),
  tagline: readEnv('VITE_APP_TAGLINE', {
    devFallback: 'Objects worth remembering.',
  }),
});

export default clientConfig;
