import { SimulationToolbox } from '@/app/types/simulation';

export const step7CirculationShock = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, waitForContinue, getUserInput, addSystem, dispatch, addCritical } = tools;

  await addHeader('STEP 7: CIRCULATION (C) & SHOCK ASSESSMENT');
  await addEMT("'I CHECK CAROTID PULSE QUALITY, SKIN SIGNS, AND COMPARE RADIAL PULSES.'");
  await waitForContinue();
  
  const pulse = await getUserInput('Carotid pulse quality is', ['RAPID/WEAK', 'NORMAL']);
  const skin = await getUserInput('Skin status is', ['WARM/DRY', 'PALE/COOL/DIAPHORETIC', 'TOO COLD OR HOT OUTSIDE']);
  
  let isShock = false;
  let eyelidColor = 'PINK';
  
  if (skin === 'TOO COLD OR HOT OUTSIDE') {
    await addSystem('Skin assessment unreliable due to environmental factors.');
    await addEMT("'CHECKING CONJUNCTIVA (UNDER EYELIDS) FOR PERFUSION STATUS.'");
    eyelidColor = await getUserInput('Conjunctiva color is', ['PINK', 'GREY/ASHY']);
  }

  if (pulse === 'RAPID/WEAK' || skin === 'PALE/COOL/DIAPHORETIC' || eyelidColor === 'GREY/ASHY') {
      isShock = true;
  }
  
  dispatch({ type: 'SET_SHOCK', payload: isShock });

  if (isShock) {
    await addCritical('PATIENT IS LIKELY EXPERIENCING SHOCK');
    await addEMT("'PLACE PATIENT IN BLANKET, POSITION FOR COMFORT.'");
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Patient covered with blanket' });
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Patient positioned for comfort' });
    dispatch({ type: 'ADD_TREATMENT', payload: 'Treated for shock' });
    await waitForContinue();
  } else {
    await addSystem('Circulation adequate. No immediate signs of shock.');
    await waitForContinue();
  }
};