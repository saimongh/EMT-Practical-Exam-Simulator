import { SimulationToolbox, AVPULevel } from '@/app/types/simulation';

export const step4AVPU = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, getUserInput, addSystem, dispatch, addCritical, waitForContinue } = tools;

  await addHeader('STEP 4: LISA - AVPU ASSESSMENT');
  await addEMT("'HEY MAN, ARE YOU AWAKE?'");
  
  const responsive = await getUserInput('Are they responsive?', ['YES', 'NO']);
  
  if (responsive === 'NO') {
    await addEMT("'PINCHING SHOULDERS AND EARLOBES...'");
    const painResponse = await getUserInput('Was there a pain response?', ['YES', 'NO']);
    
    if (painResponse === 'YES') {
      await addSystem('Patient responds to PAIN.');
      dispatch({ type: 'SET_AVPU', payload: AVPULevel.PAIN });
      await waitForContinue();
    } else {
      await addEMT("'CHECK CAROTID PULSE FOR LIFE SIGNS.'");
      const lifeSigns = await getUserInput('Are there life signs?', ['YES', 'NO']);
      
      if (lifeSigns === 'NO') {
        await addCritical('NO LIFE SIGNS DETECTED');
        await addEMT("'BEGIN EMERGENCY CPR.'");
        const cprSuccess = await getUserInput('Is CPR successful?', ['YES', 'NO']);
        
        if (cprSuccess === 'NO') {
          await addCritical('CPR UNSUCCESSFUL - PATIENT DECEASED');
          // We can handle "game over" logic in page.tsx by checking state later, 
          // or throw a specific error to catch in the main loop.
          // For now, we set pulse to false.
          dispatch({ type: 'SET_PULSE', payload: false }); 
          return;
        } else {
          await addSystem('CPR SUCCESSFUL - Patient is UNRESPONSIVE but has pulse.');
          dispatch({ type: 'SET_AVPU', payload: AVPULevel.UNRESPONSIVE });
          dispatch({ type: 'SET_PULSE', payload: true });
          dispatch({ type: 'ADD_INTERVENTION', payload: 'CPR performed successfully' });
          await waitForContinue();
        }
      } else {
        await addSystem('Pulse present - Patient is UNRESPONSIVE.');
        dispatch({ type: 'SET_AVPU', payload: AVPULevel.UNRESPONSIVE });
        dispatch({ type: 'SET_PULSE', payload: true });
        await waitForContinue();
      }
    }
  } else {
    // Alert or Verbal
    await addEMT("'HI, MY NAME IS EMT SMITH, THIS IS MY PARTNER EMT JONES.'");
    await addEMT("'CAN YOU TELL ME IF IT'S DAY OR NIGHT?'");
    const answerCorrect = await getUserInput('Do they answer correctly?', ['YES', 'NO']);
    
    if (answerCorrect === 'YES') {
      await addSystem('Patient is ALERT and oriented.');
      dispatch({ type: 'SET_AVPU', payload: AVPULevel.ALERT });
      dispatch({ type: 'SET_AIRWAY', payload: true }); // A is clear if talking
      await addSystem('Airway is clear due to alert status.');
    } else {
      await addSystem('Patient is VERBAL but not fully oriented.');
      dispatch({ type: 'SET_AVPU', payload: AVPULevel.VERBAL });
      dispatch({ type: 'SET_AIRWAY', payload: true }); // A is clear if talking
      await addSystem('Airway is clear due to verbal status.');
    }
    await waitForContinue();
  }
};