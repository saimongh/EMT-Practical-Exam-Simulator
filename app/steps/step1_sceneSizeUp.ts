import { SimulationToolbox } from '../types/simulation';

export const step1SceneSizeUp = async (tools: SimulationToolbox) => {
  const { addHeader, addSystem, waitForContinue, getPatient } = tools;
  // We get the patient state here to display dynamic age/sex if needed
  const patient = getPatient();

  await addHeader('STEP 1: SCENE SIZE-UP & INITIAL ACTIONS');
  await addSystem('BSI PRECAUTIONS CONFIRMED. SCENE IS SAFE.');
  await addSystem(`MOI: ${patient.age}-YEAR-OLD ${patient.sex}, GSW sustained 5 minutes ago.`);
  await waitForContinue();
};