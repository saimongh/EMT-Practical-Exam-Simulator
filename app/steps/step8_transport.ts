import { SimulationToolbox } from '../types/simulation';

export const step8TransportDecision = async (tools: SimulationToolbox) => {
  const { addHeader, addCritical, addEMT, dispatch, waitForContinue, addSystem, getPatient } = tools;
  
  // We read from the state, no arguments needed!
  const patient = getPatient();

  await addHeader('STEP 8: TRANSPORT DECISION & COMMUNICATION');

  if (patient.isInShock) {
    await addCritical('INITIATING SHOCK PROTOCOL');
    await addEMT("'PREPARE FOR RAPID TRANSPORT - THIS IS A LOAD-AND-GO.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Shock protocol initiated' });
    await addEMT("'CONTROL, THIS IS MEDIC 5. REQUESTING ALS.'");
    await addEMT("'WE HAVE A HIGH-PRIORITY TRAUMA WITH SIGNS OF SHOCK. ETA 8 MINUTES.'");
    await waitForContinue();
  } else {
    await addSystem('No immediate shock signs, but rapid transport indicated due to MOI.');
    await addEMT("'PREPARING FOR RAPID TRANSPORT BASED ON MECHANISM OF INJURY.'");
    await waitForContinue();
  }
  
  await addEMT("'CHECK BYSTANDERS FOR SAMPLE HISTORY AND PATIENT FOR MEDICAL ALERT JEWELRY.'");
  await waitForContinue();
};