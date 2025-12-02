"use client";

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { AlertCircle, Activity, Heart } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & ENUMS
// ═══════════════════════════════════════════════════════════════════════════

const AVPULevel = {
  ALERT: 'A',
  VERBAL: 'V',
  PAIN: 'P',
  UNRESPONSIVE: 'U'
};

const GSWLocation = {
  CHEST: 'CHEST',
  ARM: 'ARM',
  ABDOMEN: 'ABDOMEN'
};

const CallType = {
  MEDICAL: 'MEDICAL',
  TRAUMA: 'TRAUMA'
};

const TraumaType = {
  GSW: 'GSW',
  LADDER_FALL: 'LADDER_FALL',
  CAR_ACCIDENT: 'CAR_ACCIDENT'
};

const MessageType = {
  SYSTEM: 'system',
  EMT: 'emt',
  CRITICAL: 'critical',
  WARNING: 'warning',
  HEADER: 'header',
  DIM: 'dim',
  INPUT: 'input'
};

// ---------------------------------------------------------------------------
// 🚨 FIX: DEFINING ALL TYPES FOR TYPESCRIPT BUILD SUCCESS 🚨
// ---------------------------------------------------------------------------

// 1. Define the structure of the patient state object
interface PatientState {
  age: number;
  sex: string;
  callType: string | null;
  traumaType: string | null;
  gswLocation: string | null;
  avpuStatus: string | null;
  airwayPatent: boolean;
  isBreathingAdequate: boolean;
  hasPulse: boolean;
  isInShock: boolean;
  interventions: string[];
  treatmentsApplied: string[];
}

// 2. Define the structure of the actions that can be dispatched
type PatientAction = 
  | { type: 'SET_CALL_TYPE'; payload: string }
  | { type: 'SET_TRAUMA_TYPE'; payload: string }
  | { type: 'SET_GSW_LOCATION'; payload: string }
  | { type: 'SET_AVPU'; payload: string }
  | { type: 'SET_PULSE'; payload: boolean }
  | { type: 'SET_AIRWAY'; payload: boolean }
  | { type: 'SET_BREATHING'; payload: boolean }
  | { type: 'SET_SHOCK'; payload: boolean }
  | { type: 'ADD_INTERVENTION'; payload: string }
  | { type: 'ADD_TREATMENT'; payload: string }
  | { type: 'RESET' };

// 3. Define the structure of the messages array (to fix the final useState error)
interface Message {
  text: string;
  type: string;
  id: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT STATE & REDUCER
// ═══════════════════════════════════════════════════════════════════════════

const initialPatientState: PatientState = {
  age: 25,
  sex: 'MALE',
  callType: null,
  traumaType: null,
  gswLocation: null,
  avpuStatus: null,
  airwayPatent: false,
  isBreathingAdequate: false,
  hasPulse: true,
  isInShock: false,
  interventions: [],
  treatmentsApplied: []
};

function patientReducer(state: PatientState, action: PatientAction): PatientState {
  switch (action.type) {
    case 'SET_CALL_TYPE':
      return { ...state, callType: action.payload };
    case 'SET_TRAUMA_TYPE':
      return { ...state, traumaType: action.payload };
    case 'SET_GSW_LOCATION':
      return { ...state, gswLocation: action.payload };
    case 'SET_AVPU':
      return { ...state, avpuStatus: action.payload };
    case 'SET_PULSE':
      return { ...state, hasPulse: action.payload };
    case 'SET_AIRWAY':
      return { ...state, airwayPatent: action.payload };
    case 'SET_BREATHING':
      return { ...state, isBreathingAdequate: action.payload };
    case 'SET_SHOCK':
      return { ...state, isInShock: action.payload };
    case 'ADD_INTERVENTION':
      return { ...state, interventions: [...state.interventions, action.payload] };
    case 'ADD_TREATMENT':
      return { ...state, treatmentsApplied: [...state.treatmentsApplied, action.payload] };
    case 'RESET':
      return initialPatientState;
    default:
      // You should handle unreachable action types here, but for now, return state
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SIMULATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function EMTSimulator() {
  const [patient, dispatchPatient] = useReducer(patientReducer, initialPatientState);
  const [messages, setMessages] = useState<Message[]>([]); // FIX: Use Message[] type
  const [currentStep, setCurrentStep] = useState('welcome');
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [validOptions, setValidOptions] = useState<string[]>([]); // Added string[] type
  const [inputPrompt, setInputPrompt] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null); // FIX: Explicitly typed useRef

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ───────────────────────────────────────────────────────────────────────
  // MESSAGE UTILITIES (FIX: Explicitly typed parameters)
  // ───────────────────────────────────────────────────────────────────────

  const addMessage = (text: string, type: string = MessageType.SYSTEM, delay: number = 300): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setMessages(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
        resolve();
      }, delay);
    });
  };

  const addHeader = (text: string) => addMessage(text, MessageType.HEADER, 400);
  const addSystem = (text: string) => addMessage(`⚕ SYSTEM: ${text}`, MessageType.SYSTEM, 200);
  const addEMT = (text: string) => addMessage(`➤ EMT: ${text}`, MessageType.EMT, 200);
  const addCritical = (text: string) => addMessage(`⚠ CRITICAL: ${text}`, MessageType.CRITICAL, 200);
  const addDim = (text: string) => addMessage(text, MessageType.DIM, 100);

  const getUserInput = (prompt: string, options: string[]): Promise<string> => {
    return new Promise(resolve => {
      setInputPrompt(prompt);
      setValidOptions(options);
      setAwaitingInput(true);
      
      const handleInput = (value: string) => {
        setAwaitingInput(false);
        addMessage(`> ${value}`, MessageType.INPUT, 0);
        resolve(value);
      };
      
      (window as any).handleSimInput = handleInput;
    });
  };

  const waitForContinue = (): Promise<void> => {
    return new Promise(resolve => {
      setAwaitingContinue(true);
      
      const handleContinue = () => {
        setAwaitingContinue(false);
        resolve();
      };
      
      (window as any).handleSimContinue = handleContinue;
    });
  };

  const handleOptionClick = (option: string) => {
    if (awaitingInput && (window as any).handleSimInput) {
      (window as any).handleSimInput(option);
    }
  };

  const handleContinueClick = () => {
    if (awaitingContinue && (window as any).handleSimContinue) {
      (window as any).handleSimContinue();
    }
  };

  // ───────────────────────────────────────────────────────────────────────
  // SIMULATION STEPS
  // ───────────────────────────────────────────────────────────────────────

  const runSimulation = async () => {
    try {
      const callType = await selectCallType();
      
      if (callType === CallType.MEDICAL) {
        await runMedicalProtocol();
      } else {
        await runTraumaProtocol();
      }
      
      setSimulationComplete(true);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  const selectCallType = async () => {
    const type = await getUserInput('What type of call is this?', ['MEDICAL', 'TRAUMA']);
    dispatchPatient({ type: 'SET_CALL_TYPE', payload: type });
    return type;
  };

  const runMedicalProtocol = async () => {
    await addHeader('MEDICAL PROTOCOL');
    await addSystem('Medical protocol is under development.');
    await addSystem('This branch will be implemented in a future update.');
  };

  const runTraumaProtocol = async () => {
    const traumaType = await selectTraumaType();
    
    if (traumaType === TraumaType.GSW) {
      await runGSWProtocol();
    } else if (traumaType === TraumaType.LADDER_FALL) {
      await runLadderFallProtocol();
    } else if (traumaType === TraumaType.CAR_ACCIDENT) {
      await runCarAccidentProtocol();
    }
  };

  const selectTraumaType = async () => {
    const type = await getUserInput('What type of trauma call?', ['GSW', 'LADDER_FALL', 'CAR_ACCIDENT']);
    dispatchPatient({ type: 'SET_TRAUMA_TYPE', payload: type });
    return type;
  };

  const runGSWProtocol = async () => {
    await step1SceneSizeUp();
    await step2LifeThreats();
    await step3ImpressionsSpinal();
    const needsAirway = await step4AVPU();
    if (needsAirway) await step5AirwayManagement();
    await step6OxygenBreathing();
    // FIX: CAPTURE the shock status returned from step 7
    const shockDetected = await step7CirculationShock();
    // FIX: PASS the status directly to step 8
    await step8TransportDecision(shockDetected);
    await step9RapidTrauma();
    await step10Reassessment();
    await displayFinalSummary(patient);
  };

  const runLadderFallProtocol = async () => {
    await addHeader('LADDER FALL PROTOCOL');
    await addSystem('Ladder fall protocol is under development.');
    await addSystem('This branch will be implemented in a future update.');
  };

  const runCarAccidentProtocol = async () => {
    await addHeader('CAR ACCIDENT PROTOCOL');
    await addSystem('Car accident protocol is under development.');
    await addSystem('This branch will be implemented in a future update.');
  };

  const step1SceneSizeUp = async () => {
    await addHeader('STEP 1: SCENE SIZE-UP & INITIAL ACTIONS');
    await addSystem('BSI PRECAUTIONS CONFIRMED. SCENE IS SAFE.');
    await addSystem('MOI: 25-YEAR-OLD MALE, GSW sustained 5 minutes ago.');
    await waitForContinue();
  };

  const step2LifeThreats = async () => {
    await addHeader('STEP 2: LISA - LIFE THREATS');
    await addCritical('Life Threat Identified: GSW');
    
    const gswLocation = await getUserInput('Where is the gunshot wound?', ['CHEST', 'ABDOMEN', 'ARM']);
    dispatchPatient({ type: 'SET_GSW_LOCATION', payload: gswLocation });
    
    if (gswLocation === GSWLocation.CHEST) {
      await addEMT("'TREAT IMMEDIATELY WITH AN OCCLUSIVE DRESSING (Chest Seal).'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Occlusive dressing applied to chest' });
      dispatchPatient({ type: 'ADD_TREATMENT', payload: 'Treated GSW to chest with occlusive dressing' });
      await waitForContinue();
    } else if (gswLocation === GSWLocation.ARM) {
      await addSystem('ARM GSW protocol is under development.');
      await addSystem('This branch will be implemented in a future update.');
    } else if (gswLocation === GSWLocation.ABDOMEN) {
      await addSystem('ABDOMEN GSW protocol is under development.');
      await addSystem('This branch will be implemented in a future update.');
    }
  };

  const step3ImpressionsSpinal = async () => {
    await addHeader('STEP 3: LISA - IMPRESSIONS & SPINAL PRECAUTIONS');
    await addEMT(`'OKAY, I GOT A ${patient.age}-YEAR-OLD ${patient.sex}, SUPINE, APPEARS UNRESPONSIVE.'`);
    await addEMT("'MY PARTNERS ARE INITIATING C-SPINE STABILIZATION AND APPLYING C-COLLAR.'");
    dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'C-spine stabilization + C-collar' });
    await waitForContinue();
    
    await addEMT("'I AM MAKING THE DECISION TO CALL ALS IMMEDIATELY.'");
    await waitForContinue();
  };

  const step4AVPU = async () => {
    await addHeader('STEP 4: LISA - AVPU ASSESSMENT');
    await addEMT("'HEY MAN, ARE YOU AWAKE?'");
    
    const responsive = await getUserInput('Are they responsive?', ['YES', 'NO']);
    
    if (responsive === 'NO') {
      await addEMT("'PINCHING SHOULDERS AND EARLOBES...'");
      const painResponse = await getUserInput('Was there a pain response?', ['YES', 'NO']);
      
      if (painResponse === 'YES') {
        await addSystem('Patient responds to PAIN.');
        dispatchPatient({ type: 'SET_AVPU', payload: AVPULevel.PAIN });
        await waitForContinue();
        return true; // Needs airway management
      } else {
        await addEMT("'CHECK CAROTID PULSE FOR LIFE SIGNS.'");
        const lifeSigns = await getUserInput('Are there life signs?', ['YES', 'NO']);
        
        if (lifeSigns === 'NO') {
          await addCritical('NO LIFE SIGNS DETECTED');
          await addEMT("'BEGIN EMERGENCY CPR.'");
          const cprSuccess = await getUserInput('Is CPR successful?', ['YES', 'NO']);
          
          if (cprSuccess === 'NO') {
            await addCritical('CPR UNSUCCESSFUL - PATIENT DECEASED');
            await addSystem('SIMULATION TERMINATED');
            setSimulationComplete(true);
            return false;
          } else {
            await addSystem('CPR SUCCESSFUL - Patient is UNRESPONSIVE but has pulse.');
            dispatchPatient({ type: 'SET_AVPU', payload: AVPULevel.UNRESPONSIVE });
            dispatchPatient({ type: 'SET_PULSE', payload: true });
            dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'CPR performed successfully' });
            await waitForContinue();
            return true; // Needs airway management
          }
        } else {
          await addSystem('Pulse present - Patient is UNRESPONSIVE.');
          dispatchPatient({ type: 'SET_AVPU', payload: AVPULevel.UNRESPONSIVE });
          dispatchPatient({ type: 'SET_PULSE', payload: true });
          await waitForContinue();
          return true; // Needs airway management
        }
      }
    } else {
      await addEMT("'HI, MY NAME IS EMT SMITH, THIS IS MY PARTNER EMT JONES.'");
      await addEMT("'CAN YOU TELL ME IF IT'S DAY OR NIGHT?'");
      const answerCorrect = await getUserInput('Do they answer correctly?', ['YES', 'NO']);
      
      if (answerCorrect === 'YES') {
        await addSystem('Patient is ALERT and oriented.');
        dispatchPatient({ type: 'SET_AVPU', payload: AVPULevel.ALERT });
        dispatchPatient({ type: 'SET_AIRWAY', payload: true });
        await addSystem('Airway is clear due to alert status.');
        await waitForContinue();
        return false; // Skip airway management
      } else {
        await addSystem('Patient is VERBAL but not fully oriented.');
        dispatchPatient({ type: 'SET_AVPU', payload: AVPULevel.VERBAL });
        dispatchPatient({ type: 'SET_AIRWAY', payload: true });
        await addSystem('Airway is clear due to verbal status.');
        await waitForContinue();
        return false; // Skip airway management
      }
    }
  };

  const step5AirwayManagement = async () => {
    await addHeader('STEP 5: AIRWAY (A) MANAGEMENT');
    await addEMT("'OPEN AIRWAY USING JAW-THRUST MANEUVER (trauma suspected).'");
    await waitForContinue();
    
    const airway = await getUserInput('What is the airway status?', ['CLEAR', 'GURGLE', 'DEBRIS']);
    
    if (airway === 'GURGLE') {
      await addEMT("'I SUCTION FLUIDS IN A CIRCULAR MOTION FOR NO MORE THAN 15 SECONDS.'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Airway suctioning performed' });
      await waitForContinue();
    } else if (airway === 'DEBRIS') {
      await addEMT("'I USE A GLOVED FINGER TO SWEEP AND REMOVE VISIBLE DEBRIS.'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Manual airway clearance' });
      await waitForContinue();
    }
    
    await addEMT("'I MEASURE AND INSERT THE OROPHARYNGEAL AIRWAY (OPA).'");
    const opa = await getUserInput('Does the patient tolerate the OPA (no gag reflex)?', ['YES', 'NO']);
    
    if (opa === 'YES') {
      await addEMT("'OPA ACCEPTED AND SECURED.'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'OPA inserted' });
      await addEMT("'I ADMINISTER HIGH-FLOW OXYGEN AT 15 LPM AND VENTILATE 1 BREATH EVERY 5-6 SECONDS.'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'O2 AT 15L NRB' });
      await waitForContinue();
    } else {
      await addEMT("'OPA NOT TOLERATED. REMOVING OPA AND SWITCHING TO NPA.'");
      await addEMT("'I ADMINISTER  OXYGEN AT 6 LPM.'");
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'O2 AT 6L NPA' });
      await waitForContinue();
    }
    dispatchPatient({ type: 'SET_AIRWAY', payload: true });
  };

  const step6OxygenBreathing = async () => {
    await addHeader('STEP 6: OXYGEN & BREATHING (B) ASSESSMENT');
    
    let adequateBreathing = false;

    while (!adequateBreathing) {
        await addEMT("'I FORM AN UPPERCASE \"I\" WITH MY HANDS, ASSESSING CHEST RISE AND FALL.'");
        const breathing = await getUserInput('Is breathing present and adequate?', ['YES', 'NO']);
        
        if (breathing === 'YES') {
            adequateBreathing = true; // Exit the loop
            await addEMT("'I FEEL ADEQUATE BREATH. MOVING TO AUSCULTATION (6-POINT CHECK).'");
            const sounds = await getUserInput('Are breath sounds equal and adequate?', ['YES', 'NO']);
            
            if (sounds === 'YES') {
                await addSystem('Breath sounds equal bilaterally. Breathing adequate.');
                dispatchPatient({ type: 'SET_BREATHING', payload: true });
            } else {
                await addSystem('Breath sounds DIMINISHED. Continue monitoring closely.');
                dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Diminished breath sounds noted' });
                dispatchPatient({ type: 'SET_BREATHING', payload: true }); 
            }
            await waitForContinue();

        } else {
            // Intervention Loop
            await addCritical('BREATHING INADEQUATE OR ABSENT');
            await addEMT("'I READJUST OPA/NPA.'");
            dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Airway adjunct readjusted' });
            await addSystem('Re-assessing breathing status after intervention.');
            await waitForContinue();
            // Loop continues to re-run the `getUserInput('Is breathing present and adequate?...'` check
        }
    }
};

const step7CirculationShock = async () => {
  await addHeader('STEP 7: CIRCULATION (C) & SHOCK ASSESSMENT');
  await addEMT("'I CHECK CAROTID PULSE QUALITY, SKIN SIGNS, AND COMPARE RADIAL PULSES.'");
  await waitForContinue();
  
  // 1. Mandatory Assessments (User Input) - Always check pulse and skin first
  const pulse = await getUserInput('Carotid pulse quality is', ['RAPID/WEAK', 'NORMAL']);
  const skin = await getUserInput('Skin status is', ['WARM/DRY', 'PALE/COOL/DIAPHORETIC', 'TOO COLD OR HOT OUTSIDE TO TELL']);
  
  let isShock = false;
  let eyelidColor = 'PINK'; // Default to normal
  
  // 2. Conditional Assessment (Conjunctiva Check) - Only if skin is unreliable
  if (skin === 'TOO COLD OR HOT OUTSIDE TO TELL') {
    await addSystem('Skin assessment unreliable due to environmental factors.');
    await addEMT("'CHECKING CONJUNCTIVA (UNDER EYELIDS) FOR PERFUSION STATUS.'");
    
    eyelidColor = await getUserInput('Conjunctiva color is', ['PINK', 'GREY/ASHY']);
  }

  // 3. Shock Diagnosis Calculation (True if ANY sign is positive)
  if (
    pulse === 'RAPID/WEAK' || 
    skin === 'PALE/COOL/DIAPHORETIC' || 
    eyelidColor === 'GREY/ASHY'
  ) {
      isShock = true;
  }
  
  // 4. Final Action: Dispatch state and display message
  dispatchPatient({ type: 'SET_SHOCK', payload: isShock });

  if (isShock) {
    await addCritical('PATIENT IS LIKELY EXPERIENCING SHOCK');
    
    await addEMT("'PLACE PATIENT IN BLANKET, POSITION FOR COMFORT.'");
    dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Patient covered with blanket' });
    dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Patient positioned for comfort' });
    dispatchPatient({ type: 'ADD_TREATMENT', payload: 'Treated for shock' });
    await waitForContinue();
  } else {
    await addSystem('Circulation adequate. No immediate signs of shock.');
    await waitForContinue();
  }

  return isShock; // CRITICAL FIX: Return the diagnosis to Step 8
};
 
const step8TransportDecision = async (shockDetected: boolean) => {
  await addHeader('STEP 8: TRANSPORT DECISION & COMMUNICATION');

  // CRITICAL FIX: Use the passed 'shockDetected' boolean to avoid stale state
  if (shockDetected) {
    await addCritical('INITIATING SHOCK PROTOCOL');
    await addEMT("'PREPARE FOR RAPID TRANSPORT - THIS IS A LOAD-AND-GO.'");
    dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Shock protocol initiated' });
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

  const step9RapidTrauma = async () => {
    await addHeader('STEP 9: RAPID TRAUMA ASSESSMENT (DECAPBTLS)');
    await addEMT("'PERFORMING HEAD-TO-TOE ASSESSMENT EN ROUTE TO HOSPITAL OR WAITING FOR ALS'");
    await addDim('  D - Deformities');
    await addDim('  E - Contusions');
    await addDim('  C - Abrasions');
    await addDim('  A - Punctures/Penetrations');
    await addDim('  B - Burns');
    await addDim('  T - Tenderness');
    await addDim('  L - Lacerations');
    await addDim('  S - Swelling');
    await waitForContinue();
    
    await addEMT("'CHECKING HEAD FOR SPINAL FLUID...");
    await waitForContinue();
    await addEMT("EYES FOR EQUAL AND REACTIVE TO LIGHT...");
    await waitForContinue();
    await addEMT("EYELIDS AGAIN..."); 
    await waitForContinue();
    await addEMT("NOSE FOR LEAKAGE (SPINAL FLUID OR BLOOD)...");
    await waitForContinue();
    await addEMT("MOUTH FOR CYANOSIS OR PURSED LIPS...");
    await waitForContinue();
    await addEMT("NECK FOR TRACHEAL DEFORMITY...");
    await waitForContinue();
    await addEMT("CHEST FOR REVERIFYING DRESSINGS AND SIX POINT AUSCULTATION...");
    await waitForContinue();
    await addEMT("PALPATE ABDOMEN FOR TENDERNESS, RIGIDITY, OR DISTENTION...");
    await waitForContinue();
    await addEMT("PELVIS FOR STABILITY (GENTLE AND SIMULTANEOUS DOWNWARD AND INWARD PRESSURE...");
    
    const pelvis = await getUserInput('Is the pelvis stable?', ['YES', 'NO']);
    if (pelvis === 'YES') {
      // If stable, proceed with genitalia check
      await addEMT("GENITALIA FOR BLEEDING..."); 
    } else {
      // If unstable, skip the check and add intervention
      await addCritical('PELVIS UNSTABLE. MINIMIZING MOVEMENT.');
      dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Pelvic stabilization initiated (if required)' });
    }
    
    await addEMT("LEGS FOR SYMMETRY ...'");
    await waitForContinue();
    
    const injury = await getUserInput('Is there an injury found?', ['YES', 'NO']);
    
    if (injury === 'YES') {
        const severity = await getUserInput('Is the injury immediately life-threatening?', ['YES', 'NO']);
        
        if (severity === 'YES') {
            await addCritical('LIFE THREAT FOUND! PARTNER IS MANAGING.');
            await addEMT("'MY PARTNER WILL IMMEDIATELY APPLY APPROPRIATE INTERVENTION (e.g., direct pressure, tourniquet).'");
            dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Life-threatening injury managed by partner' });
          await waitForContinue();
        } else {
          // Non-life-threatening injury (e.g., minor laceration)
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
    dispatchPatient({ type: 'ADD_INTERVENTION', payload: 'Full immobilization on backboard' });
    await waitForContinue();
  };

  const step10Reassessment = async () => {
    await addHeader('STEP 10: REASSESSMENT PROTOCOL');
    await addEMT("'REASSESS PATIENT EVERY 5 MINUTES DURING TRANSPORT.'");
    await addDim('  • Re-check primary assessment (ABCs)');
    await addDim('  • Verify all interventions remain effective');
    await addDim('  • Monitor for changes in patient condition');
    await addDim('  • Adjust treatment plan as needed');
    await waitForContinue();
  };

  const displayFinalSummary = async (finalPatientState: PatientState) => {
    await addHeader('SIMULATION COMPLETE - PATIENT SUMMARY');
    await addMessage('Patient Status:', MessageType.SYSTEM, 200);
    await addDim(`  Age/Sex: ${finalPatientState.age}yo ${finalPatientState.sex}`);
    await addDim(`  Call Type: ${finalPatientState.callType || 'Unknown'}`);
    await addDim(`  Trauma Type: ${finalPatientState.traumaType || 'Unknown'}`);
    if (finalPatientState.gswLocation) {
      await addDim(`  GSW Location: ${finalPatientState.gswLocation}`);
    }
    await addDim(`  AVPU: ${finalPatientState.avpuStatus || 'Not assessed'}`);
    await addDim(`  Airway: ${finalPatientState.airwayPatent ? 'Patent' : 'Compromised'}`);
    await addDim(`  Breathing: ${finalPatientState.isBreathingAdequate ? 'Adequate' : 'Inadequate'}`);
    await addDim(`  Shock Status: ${finalPatientState.isInShock ? 'Present' : 'Not detected'}`);
    
    if (finalPatientState.treatmentsApplied.length > 0) {
      await addMessage('Treatments Applied:', MessageType.SYSTEM, 200);
      for (let i = 0; i < finalPatientState.treatmentsApplied.length; i++) {
        await addDim(`  ${i + 1}. ${finalPatientState.treatmentsApplied[i]}`);
      }
    }
    
    await addMessage('Interventions Applied:', MessageType.SYSTEM, 200);
    for (let i = 0; i < finalPatientState.interventions.length; i++) {
      await addDim(`  ${i + 1}. ${finalPatientState.interventions[i]}`);
    }
    
    await addSystem('Assessment protocol completed successfully.');
    await addDim('Review your performance and consider alternative scenarios.');
  };

  // Start simulation on mount
  useEffect(() => {
    const welcome = async () => {
      await addHeader('EMT PRIMARY ASSESSMENT SIMULATOR');
      await addMessage('Emergency Medical Services Training', MessageType.HEADER, 300);
      await new Promise(resolve => setTimeout(resolve, 800));
      runSimulation();
    };
    welcome();
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────

  const getMessageStyle = (type: string) => {
    switch (type) {
      case MessageType.SYSTEM:
        return 'text-cyan-400';
      case MessageType.EMT:
        return 'text-green-400';
      case MessageType.CRITICAL:
        return 'text-red-400 font-bold';
      case MessageType.WARNING:
        return 'text-yellow-400';
      case MessageType.HEADER:
        return 'text-blue-400 font-bold text-center text-lg border-t-2 border-b-2 border-blue-400/30 py-2 my-3';
      case MessageType.DIM:
        return 'text-gray-500';
      case MessageType.INPUT:
        return 'text-purple-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Glass Container */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10 p-4 flex items-center gap-3">
            <Activity className="text-cyan-400" size={24} />
            <div className="flex-1">
              <h1 className="text-white font-bold text-lg">EMT PRIMARY ASSESSMENT SIMULATOR</h1>
              <p className="text-gray-400 text-sm">Emergency Medical Services Training</p>
            </div>
            <Heart className="text-red-400 animate-pulse" size={24} />
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-sm scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 ${getMessageStyle(msg.type)}`}>
                {msg.type === MessageType.HEADER ? (
                  <div className="my-4">{msg.text}</div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-black/30 p-4">
            {awaitingInput ? (
              <div className="space-y-3">
                <div className="text-cyan-400 text-sm font-mono">
                  <span className="text-gray-500">┌─────────────────────────────────────────────────────────────┐</span>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-cyan-400 font-mono">│ PROMPT:</span>
                  <span className="text-gray-300 font-mono flex-1">
                    {inputPrompt}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-cyan-400 font-mono">│ SELECT:</span>
                  <div className="flex gap-3 flex-wrap">
                    {validOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono px-4 py-2 rounded transition-all hover:scale-105 active:scale-95"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-cyan-400 text-sm font-mono">
                  <span className="text-gray-500">└─────────────────────────────────────────────────────────────┘</span>
                </div>
              </div>
            ) : awaitingContinue ? (
              <div className="text-center">
                <button
                  onClick={handleContinueClick}
                  className="bg-green-600 hover:bg-green-700 text-white font-mono px-6 py-2 rounded-lg transition-colors"
                >
                  Continue →
                </button>
              </div>
            ) : simulationComplete ? (
              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono px-6 py-2 rounded-lg transition-colors"
                >
                  Restart Simulation
                </button>
              </div>
            ) : (
              <div className="text-gray-500 font-mono text-center">
                <AlertCircle className="inline mr-2" size={16} />
                Simulation in progress...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
