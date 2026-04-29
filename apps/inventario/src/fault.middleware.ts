const FAULT_START = Date.now();

function parseEnvMs(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const FAULT_DELAY_MS = parseEnvMs(process.env.FAULT_DELAY_MS);
const RECOVERY_TIME_MS = parseEnvMs(process.env.RECOVERY_TIME_MS);

export function isFaulting(): boolean {
  if (FAULT_DELAY_MS <= 0) {
    return false;
  }

  if (RECOVERY_TIME_MS <= 0) {
    return true;
  }

  return Date.now() - FAULT_START < RECOVERY_TIME_MS;
}

export async function applyFaultDelay(): Promise<void> {
  if (!isFaulting()) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, FAULT_DELAY_MS);
  });
}
