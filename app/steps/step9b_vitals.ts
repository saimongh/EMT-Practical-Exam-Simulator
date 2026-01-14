import { SimulationToolbox } from '../types/simulation';

export const step9bVitals = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, waitForContinue } = tools;

  addHeader("vital signs");
  addEMT("i'm taking a full set of vitals now.");
  
  // placeholder vitals logic
    await waitForContinue();
    await addEMT("blood pressure is as follows...");
    await waitForContinue();
    await addEMT("pulse is as follows...");
    await waitForContinue();
    await addEMT("respirations are as follows...");
    await waitForContinue();
    await addEMT("oxygen saturation is as follows...");
    await waitForContinue();
    await addEMT("skin is as follows...");
    await waitForContinue();
};