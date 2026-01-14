import { SimulationToolbox } from '../types/simulation';

export const step5AirwayManagement = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, waitForContinue, getUserInput, dispatch } = tools;

  await addHeader('STEP 5: AIRWAY (A) MANAGEMENT');
  await addEMT("'OPEN AIRWAY USING JAW-THRUST MANEUVER (trauma suspected).'");
  await waitForContinue();
  
  const airway = await getUserInput('What is the airway status?', ['CLEAR', 'GURGLE', 'DEBRIS']);
  
  if (airway === 'GURGLE') {
    await addEMT("'I SUCTION FLUIDS IN A CIRCULAR MOTION FOR NO MORE THAN 15 SECONDS.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Airway suctioning performed' });
    await waitForContinue();
  } else if (airway === 'DEBRIS') {
    await addEMT("'I USE A GLOVED FINGER TO SWEEP AND REMOVE VISIBLE DEBRIS.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Manual airway clearance' });
    await waitForContinue();
  }
  
  await addEMT("'I MEASURE AND INSERT THE OROPHARYNGEAL AIRWAY (OPA).'");
  const opa = await getUserInput('Does the patient tolerate the OPA (no gag reflex)?', ['YES', 'NO']);
  
  if (opa === 'YES') {
    await addEMT("'OPA ACCEPTED AND SECURED.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'OPA inserted' });
    await addEMT("'I ADMINISTER HIGH-FLOW OXYGEN AT 15 LPM AND VENTILATE 1 BREATH EVERY 5-6 SECONDS.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'O2 AT 15L NRB' });
    await waitForContinue();
  } else {
    await addEMT("'OPA NOT TOLERATED. REMOVING OPA AND SWITCHING TO NPA.'");
    await addEMT("'I ADMINISTER OXYGEN AT 6 LPM.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'O2 AT 6L NPA' });
    await waitForContinue();
  }
  dispatch({ type: 'SET_AIRWAY', payload: true });
};