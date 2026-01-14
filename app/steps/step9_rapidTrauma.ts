import { SimulationToolbox } from '../types/simulation';

export const step9RapidTrauma = async (tools: SimulationToolbox) => {
  const { addHeader, addEMT, addDim, waitForContinue, getUserInput, addCritical, dispatch, addSystem } = tools;

  await addHeader('STEP 9: RAPID TRAUMA ASSESSMENT (DECAPBTLS)');
  await addEMT("'PERFORMING HEAD-TO-TOE ASSESSMENT EN ROUTE TO HOSPITAL OR WAITING FOR ALS'");
  await addDim('  D - Deformities\n  E - Contusions\n  C - Abrasions\n  A - Punctures/Penetrations\n  B - Burns\n  T - Tenderness\n  L - Lacerations\n  S - Swelling');
  await waitForContinue();
  
  const bodyParts = [
    "CHECKING HEAD FOR SPINAL FLUID...",
    "EYES FOR EQUAL AND REACTIVE TO LIGHT...",
    "NOSE FOR LEAKAGE (SPINAL FLUID OR BLOOD)...",
    "MOUTH FOR CYANOSIS OR PURSED LIPS...",
    "NECK FOR TRACHEAL DEFORMITY...",
    "CHEST FOR REVERIFYING DRESSINGS AND SIX POINT AUSCULTATION...",
    "PALPATE ABDOMEN FOR TENDERNESS, RIGIDITY, OR DISTENTION..."
  ];

  for (const part of bodyParts) {
    await addEMT(part);
    await waitForContinue();
  }

  await addEMT("PELVIS FOR STABILITY (GENTLE AND SIMULTANEOUS DOWNWARD AND INWARD PRESSURE...");
  const pelvis = await getUserInput('Is the pelvis stable?', ['YES', 'NO']);
  if (pelvis === 'YES') {
    await addEMT("GENITALIA FOR BLEEDING..."); 
  } else {
    await addCritical('PELVIS UNSTABLE. MINIMIZING MOVEMENT.');
    dispatch({ type: 'ADD_INTERVENTION', payload: 'Pelvic stabilization initiated (if required)' });
  }
  
  await addEMT("LEGS FOR SYMMETRY ...'");
  await waitForContinue();
  
  const injury = await getUserInput('Is there an injury found?', ['YES', 'NO']);
  if (injury === 'YES') {
      const severity = await getUserInput('Is the injury immediately life-threatening?', ['YES', 'NO']);
      if (severity === 'YES') {
          await addCritical('LIFE THREAT FOUND! PARTNER IS MANAGING.');
          dispatch({ type: 'ADD_INTERVENTION', payload: 'Life-threatening injury managed by partner' });
          await waitForContinue();
      } else {
          await addSystem('Non-life-threatening injury found. Will dress en route.');
          await waitForContinue();
      }
  }
  
  await addEMT("CHECK PEDAL PULSES AND SENSATION IN BOTH LEGS...'");
  await waitForContinue();
  await addEMT("CHECK RADIAL PULSES AGAIN...");
  await waitForContinue();
  await addEMT("ON HEADMAN'S COUNT LOG ROLL FOR BACKBOARDING. CHECKING POSTERIOR FOR ADDITIONAL INJURIES...");
  await waitForContinue();
  await addEMT("AUSCULTATE BACK LUNGS...");
  await waitForContinue();
  await addEMT("'SECURE PATIENT TO BACKBOARD WITH APPROPRIATE STRAPPING.'");
  await addEMT("'LOAD PATIENT INTO AMBULANCE FOR TRANSPORT.'");
  await waitForContinue();
  await addEMT("checking VITAL SIGNS en route... (blood pressure, pulse, respirations)'");
  dispatch({ type: 'ADD_INTERVENTION', payload: 'Full immobilization on backboard' });
  await waitForContinue();
};