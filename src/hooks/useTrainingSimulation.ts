import { useEffect } from 'react';
import { useTrainingStore } from '../store/trainingStore';

export function useTrainingSimulation() {
  const tickAgentSimulation = useTrainingStore((s) => s.tickAgentSimulation);

  useEffect(() => {
    const interval = setInterval(tickAgentSimulation, 2000);
    return () => clearInterval(interval);
  }, [tickAgentSimulation]);
}
