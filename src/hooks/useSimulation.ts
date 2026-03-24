import { useEffect } from 'react';
import { useHPDCStore } from '../store/hpdcStore';

/**
 * Drives the real-time simulation:
 *  - Every 1s: apply small live drift to temperatures, pressures, etc.
 *  - Every ~45s: simulate a new shot completion
 */
export function useSimulation() {
  const tickLive = useHPDCStore((s) => s.tickLive);
  const triggerShot = useHPDCStore((s) => s.triggerShot);
  const status = useHPDCStore((s) => s.machine.status);

  useEffect(() => {
    const liveInterval = setInterval(() => {
      if (status === 'RUNNING') tickLive();
    }, 1000);

    // Shot fires every 42-52 seconds (random cycle time simulation)
    let shotTimeout: ReturnType<typeof setTimeout>;
    function scheduleShot() {
      const delay = 42000 + Math.random() * 10000;
      shotTimeout = setTimeout(() => {
        if (status === 'RUNNING') {
          triggerShot();
        }
        scheduleShot();
      }, delay);
    }
    scheduleShot();

    return () => {
      clearInterval(liveInterval);
      clearTimeout(shotTimeout);
    };
  }, [tickLive, triggerShot, status]);
}
