import { SimulationToolbox } from '@/app/types/simulation';

export const step10Reassessment = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, addDim, waitForContinue } = tools;

  await addHeader('STEP 10: REASSESSMENT PROTOCOL');
  await addEMT("'REASSESS PATIENT EVERY 5 MINUTES DURING TRANSPORT.'");
  await addDim('  • Re-check primary assessment (ABCs)');
  await addDim('  • Verify all interventions remain effective');
  await addDim('  • Monitor for changes in patient condition');
  await addDim('  • Adjust treatment plan as needed');
  await waitForContinue();
};