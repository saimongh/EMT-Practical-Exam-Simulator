import { SimulationToolbox } from '../types/simulation';

export const step3ImpressionsSpinal = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, waitForContinue, dispatch, getPatient } = tools;
  const patient = getPatient();

  await addHeader('STEP 3: LISA - IMPRESSIONS & SPINAL PRECAUTIONS');
  await addEMT(`'OKAY, I GOT A ${patient.age}-YEAR-OLD ${patient.sex}, SUPINE, APPEARS UNRESPONSIVE.'`);
  await addEMT("'MY PARTNERS ARE INITIATING C-SPINE STABILIZATION AND APPLYING C-COLLAR.'");
  
  dispatch({ type: 'ADD_INTERVENTION', payload: 'C-spine stabilization + C-collar' });
  await waitForContinue();
  
  await addEMT("'I AM MAKING THE DECISION TO CALL ALS IMMEDIATELY.'");
  await waitForContinue();
};