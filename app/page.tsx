"use client";

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { AlertCircle, Activity, Heart, Github } from 'lucide-react';

// 1. IMPORT TYPES (Relative Path)
import { 
  PatientState, 
  PatientAction, 
  Message, 
  SimulationToolbox, 
  MessageType,
  CallType,
  TraumaType,
  AVPULevel
} from './types/simulation';

// 2. IMPORT STEPS (Relative Paths)
import { step1SceneSizeUp } from './steps/step1_sceneSizeUp';
import { step2LifeThreats } from './steps/step2_lifeThreats';
import { step3ImpressionsSpinal } from './steps/step3_impressionsSpinal';
import { step4AVPU } from './steps/step4_avpu';
import { step5AirwayManagement } from './steps/step5_airway';
import { step6OxygenBreathing } from './steps/step6_breathing';
import { step7CirculationShock } from './steps/step7_circulation';
import { step8TransportDecision } from './steps/step8_transport';
import { step9RapidTrauma } from './steps/step9_rapidTrauma';
import { step9bVitals } from './steps/step9b_vitals';
import { step10Reassessment } from './steps/step10_reassessment';

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT STATE & REDUCER
// ═══════════════════════════════════════════════════════════════════════════

const initialPatientState: PatientState = {
  age: 25,
  sex: 'MALE',
  callType: null,
  traumaType: null,
  medicalType: null,
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
    case 'SET_CALL_TYPE': return { ...state, callType: action.payload };
    case 'SET_TRAUMA_TYPE': return { ...state, traumaType: action.payload };
    case 'SET_MEDICAL_TYPE': return { ...state, medicalType: action.payload };
    case 'SET_GSW_LOCATION': return { ...state, gswLocation: action.payload };
    case 'SET_AVPU': return { ...state, avpuStatus: action.payload };
    case 'SET_PULSE': return { ...state, hasPulse: action.payload };
    case 'SET_AIRWAY': return { ...state, airwayPatent: action.payload };
    case 'SET_BREATHING': return { ...state, isBreathingAdequate: action.payload };
    case 'SET_SHOCK': return { ...state, isInShock: action.payload };
    case 'ADD_INTERVENTION': return { ...state, interventions: [...state.interventions, action.payload] };
    case 'ADD_TREATMENT': return { ...state, treatmentsApplied: [...state.treatmentsApplied, action.payload] };
    case 'RESET': return initialPatientState;
    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SIMULATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function EMTSimulator() {
  const [patient, dispatchPatient] = useReducer(patientReducer, initialPatientState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [validOptions, setValidOptions] = useState<string[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  
  // 🚨 CRITICAL: Ref to solve stale closures in async functions
  const patientRef = useRef(patient);
  useEffect(() => {
    patientRef.current = patient;
  }, [patient]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ───────────────────────────────────────────────────────────────────────
  // TOOLBOX IMPLEMENTATION
  // ───────────────────────────────────────────────────────────────────────

  const addMessage = (text: string, type: string = MessageType.SYSTEM, delay: number = 300): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setMessages(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
        resolve();
      }, delay);
    });
  };

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
      (window as any).handleSimContinue = () => {
        setAwaitingContinue(false);
        resolve();
      };
    });
  };

  // Construct the Toolbox to pass to steps
  // This bridges the gap between the modular files and this UI component
  const tools: SimulationToolbox = {
    addMessage,
    addHeader: (t) => addMessage(t, MessageType.HEADER, 400),
    addSystem: (t) => addMessage(`⚕ SYSTEM: ${t}`, MessageType.SYSTEM, 200),
    addEMT: (t) => addMessage(`➤ EMT: ${t}`, MessageType.EMT, 200),
    addCritical: (t) => addMessage(`⚠ CRITICAL: ${t}`, MessageType.CRITICAL, 200),
    addDim: (t) => addMessage(t, MessageType.DIM, 100),
    getUserInput,
    waitForContinue,
    dispatch: dispatchPatient,
    getPatient: () => patientRef.current // Always returns fresh state
  };

  // ───────────────────────────────────────────────────────────────────────
  // PROTOCOLS (Using Imported Steps)
  // ───────────────────────────────────────────────────────────────────────

  const runSimulation = async () => {
    try {
      const callType = await tools.getUserInput('What type of call is this?', ['MEDICAL', 'TRAUMA']);
      tools.dispatch({ type: 'SET_CALL_TYPE', payload: callType });
      
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

  const runMedicalProtocol = async () => {
    await tools.addHeader('MEDICAL PROTOCOL');
    await tools.addSystem('Medical protocol is under development.');
    await tools.addSystem('This branch will be implemented in a future update.');
  };

  const runTraumaProtocol = async () => {
    const traumaType = await tools.getUserInput('What type of trauma call?', ['GSW', 'LADDER_FALL', 'CAR_ACCIDENT']);
    tools.dispatch({ type: 'SET_TRAUMA_TYPE', payload: traumaType });
    patientRef.current = { ...patientRef.current, traumaType };
    
    if (traumaType === TraumaType.GSW) {
      await runGSWProtocol();
    } else if (traumaType === TraumaType.LADDER_FALL) {
        await runLadderFallProtocol();
    } else if (traumaType === TraumaType.CAR_ACCIDENT) {
        await runCarAccidentProtocol();
    }
  };

  const runGSWProtocol = async () => {
    await step1SceneSizeUp(tools);
    await step2LifeThreats(tools);
    await step3ImpressionsSpinal(tools);
    await step4AVPU(tools);
    
    const currentPatient = tools.getPatient();
    if (currentPatient.avpuStatus !== AVPULevel.ALERT || !currentPatient.airwayPatent) {
       await step5AirwayManagement(tools);
    }

    await step6OxygenBreathing(tools);
    await step7CirculationShock(tools);
    await step8TransportDecision(tools);
    
    // 9. Rapid Trauma
    await step9RapidTrauma(tools);

    // 9b. Vitals (NEW)
    await step9bVitals(tools);
    
    // 10. Reassessment
    await step10Reassessment(tools);
    
    await displayFinalSummary(tools.getPatient());
  };

  const runLadderFallProtocol = async () => {
    // 1. Scene Size Up (Will display "Fall from 20ft ladder...")
    await step1SceneSizeUp(tools);
    
    // 2. Life Threats
    await step2LifeThreats(tools);
    
    // 3. Impressions & Spinal (Crucial for falls!)
    await step3ImpressionsSpinal(tools);
    
    // 4. AVPU
    await step4AVPU(tools);
    
    // 5. Airway
    const currentPatient = tools.getPatient();
    if (currentPatient.avpuStatus !== AVPULevel.ALERT || !currentPatient.airwayPatent) {
       await step5AirwayManagement(tools);
    }

    // 6. Breathing
    await step6OxygenBreathing(tools);
    
    // 7. Circulation
    await step7CirculationShock(tools);
    
    // 8. Transport Decision
    await step8TransportDecision(tools);
    
    // 9. Rapid Trauma
    await step9RapidTrauma(tools);

    // 9b. Vitals (NEW)
    await step9bVitals(tools);
    
    // 10. Reassessment
    await step10Reassessment(tools);
    
    await displayFinalSummary(tools.getPatient());
  };

  const runCarAccidentProtocol = async () => {
    // Reusing the GSW logic for now, but with the CAR_ACCIDENT trauma type set.
    // The conditional logic we just added to Step 1 and Step 9 will handle the differences!
    
    // 1. Scene Size Up (Now detects "Car Accident" trauma type)
    await step1SceneSizeUp(tools);
    
    // 2. Life Threats
    await step2LifeThreats(tools);
    
    // 3. Impressions & Spinal
    await step3ImpressionsSpinal(tools);
    
    // 4. AVPU
    await step4AVPU(tools);
    
    // 5. Airway Logic
    const currentPatient = tools.getPatient();
    if (currentPatient.avpuStatus !== AVPULevel.ALERT || !currentPatient.airwayPatent) {
       await step5AirwayManagement(tools);
    }

    // 6. Breathing
    await step6OxygenBreathing(tools);
    
    // 7. Circulation
    await step7CirculationShock(tools);
    
    // 8. Transport Decision
    await step8TransportDecision(tools);
    
    // 9. Rapid Trauma (Now includes Fracture Logic)
    await step9RapidTrauma(tools);
    await step9bVitals(tools);
    
    // 10. Reassessment
    await step10Reassessment(tools);
    
    await displayFinalSummary(tools.getPatient());
  };

  const displayFinalSummary = async (finalPatientState: PatientState) => {
    await tools.addHeader('SIMULATION COMPLETE - PATIENT SUMMARY');
    await tools.addMessage('Patient Status:', MessageType.SYSTEM, 200);
    await tools.addDim(`  Age/Sex: ${finalPatientState.age}yo ${finalPatientState.sex}`);
    await tools.addDim(`  Call Type: ${finalPatientState.callType || 'Unknown'}`);
    await tools.addDim(`  Trauma Type: ${finalPatientState.traumaType || 'Unknown'}`);
    if (finalPatientState.gswLocation) {
      await tools.addDim(`  GSW Location: ${finalPatientState.gswLocation}`);
    }
    await tools.addDim(`  AVPU: ${finalPatientState.avpuStatus || 'Not assessed'}`);
    await tools.addDim(`  Airway: ${finalPatientState.airwayPatent ? 'Patent' : 'Compromised'}`);
    await tools.addDim(`  Breathing: ${finalPatientState.isBreathingAdequate ? 'Adequate' : 'Inadequate'}`);
    await tools.addDim(`  Shock Status: ${finalPatientState.isInShock ? 'Present' : 'Not detected'}`);
    
    if (finalPatientState.treatmentsApplied.length > 0) {
      await tools.addMessage('Treatments Applied:', MessageType.SYSTEM, 200);
      for (let i = 0; i < finalPatientState.treatmentsApplied.length; i++) {
        await tools.addDim(`  ${i + 1}. ${finalPatientState.treatmentsApplied[i]}`);
      }
    }
    
    await tools.addMessage('Interventions Applied:', MessageType.SYSTEM, 200);
    for (let i = 0; i < finalPatientState.interventions.length; i++) {
      await tools.addDim(`  ${i + 1}. ${finalPatientState.interventions[i]}`);
    }
    
    await tools.addSystem('Assessment protocol completed successfully.');
    await tools.addDim('Review your performance and consider alternative scenarios.');
  };

  // ───────────────────────────────────────────────────────────────────────
  // UI HANDLERS
  // ───────────────────────────────────────────────────────────────────────

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

  // Start simulation on mount
  useEffect(() => {
    const welcome = async () => {
      await tools.addHeader('EMT PRIMARY ASSESSMENT SIMULATOR');
      await tools.addMessage('Emergency Medical Services Training', MessageType.HEADER, 300);
      await new Promise(resolve => setTimeout(resolve, 800));
      runSimulation();
    };
    welcome();
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // RENDER (THE ORIGINAL UI IS RESTORED BELOW)
  // ───────────────────────────────────────────────────────────────────────

  const getMessageStyle = (type: string) => {
    switch (type) {
      case MessageType.SYSTEM:
        return 'text-cyan-400';
      case MessageType.EMT:
        return 'text-green-400';
      case MessageType.CRITICAL:
        return 'text-red-400 font-bold';
      case MessageType.SYSTEM: // Change WARNING to SYSTEM
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
            <div className="flex items-center gap-4">
              <Heart className="text-red-400 animate-pulse" size={24} />
              
              <a 
                href="https://github.com/saimongh/EMT-Practical-Exam-Simulator/tree/main#readme" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10"
              >
                {/* using a standard github icon from lucide if you have it, otherwise an img tag */}
                <Github size={18} className="text-white" /> 
                <span className="text-white text-sm font-medium">Source Code</span>
              </a>
            </div>
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
