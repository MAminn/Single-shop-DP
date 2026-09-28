import { db } from "#root/shared/database/drizzle/db";
import { getCodAutoConfirmEnabledRaw } from "#root/backend/settings/cod-auto-confirm";
import { confirmPendingCodOrders } from "./confirm-batch";

const TICK_INTERVAL_MS = 10 * 60_000; // 10 minutes
/** How long a COD order sits untouched in "pending" before auto-confirming. */
const AUTO_CONFIRM_DELAY_MS = 60 * 60_000; // 1 hour

let tickInFlight = false;

async function tick(): Promise<void> {
  if (tickInFlight) return; // previous tick still running — skip, don't overlap
  tickInFlight = true;
  try {
    // Re-read every tick (not cached) so the admin's toggle takes effect
    // within ~10 minutes, no redeploy needed.
    const enabled = await getCodAutoConfirmEnabledRaw();
    if (!enabled) return;

    const confirmed = await confirmPendingCodOrders(db(), {
      olderThanMs: AUTO_CONFIRM_DELAY_MS,
      actor: "system (auto-confirm)",
    });

    if (confirmed.length > 0) {
      console.info(
        `[CodAutoConfirm] Auto-confirmed ${confirmed.length} COD order(s) untouched for over ${AUTO_CONFIRM_DELAY_MS / 60_000}m`,
      );
    }
  } catch (err) {
    console.error("[CodAutoConfirm] Tick failed:", err);
  } finally {
    tickInFlight = false;
  }
}

export interface CodAutoConfirmWorkerHandle {
  stop(): void;
}

/**
 * Starts the background poller that auto-confirms stale pending COD orders
 * when the admin has switched the setting on. The interval always runs;
 * whether it actually does anything is decided per-tick from the DB-backed
 * setting, same pattern as the email automation worker. Off by default —
 * until turned on, COD orders only ever leave "pending" via a manual admin
 * action, exactly as before this worker existed.
 */
export function startCodAutoConfirmWorker(): CodAutoConfirmWorkerHandle {
  const intervalId = setInterval(() => {
    void tick();
  }, TICK_INTERVAL_MS);
  intervalId.unref?.();

  console.info(
    `[CodAutoConfirm] Started — checking every ${TICK_INTERVAL_MS / 60_000}m (auto-confirm delay ${AUTO_CONFIRM_DELAY_MS / 60_000}m, off by default)`,
  );

  void tick();

  return {
    stop: () => clearInterval(intervalId),
  };
}
