import { SimulationToolbox, GSWLocation } from '@/app/types/simulation';

export const step2LifeThreats = async (tools: SimulationToolbox) => {
  const { addHeader, addCritical, getUserInput, addEMT, dispatch, addTreatment, waitForContinue, addSystem } = tools;
  
  await addHeader('STEP 2: LISA - LIFE THREATS');
  await addCritical('Life Threat Identified: GSW');
  
  const gswLocation = await getUserInput('Where is the gunshot wound?', ['CHEST', 'ABDOMEN', 'ARM']);
  dispatch({ type: 'SET_GSW_LOCATION', payload: gswLocation });
  
  if (gswLocation === GSWLocation.CHEST) {
    await addEMT("'TREAT IMMEDIATELY WITH AN OCCLUSIVE DRESSING (Chest Seal).'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Occlusive dressing applied to chest' });
    dispatch({ type: 'ADD_TREATMENT', payload: 'Treated GSW to chest with occlusive dressing' });
    await waitForContinue();
  } else {
    // Placeholder for other branches
    await addSystem(`${gswLocation} GSW protocol is under development.`);
  }
};