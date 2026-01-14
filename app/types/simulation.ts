// 1. MESSAGING TYPES
export interface Message {
    id?: number;
    text: string;
    type: string;
  }
  
  export const MessageType = {
    SYSTEM: 'SYSTEM',
    EMT: 'EMT',
    CRITICAL: 'CRITICAL',
    DIM: 'DIM',
    HEADER: 'HEADER',
    INPUT: 'INPUT'
  } as const;
  
  // 2. ENUMS & CONSTANTS
  
  // NEW: Call Types (Medical vs Trauma)
  export const CallType = {
    MEDICAL: 'MEDICAL',
    TRAUMA: 'TRAUMA'
  } as const;
  
  // NEW: Medical Types (Matches page.tsx inputs)
  export const MedicalType = {
    CHEST_PAIN: 'CHEST_PAIN',
    DIFFICULTY_BREATHING: 'DIFF_BREATHING', 
    COLLAPSED_PATIENT: 'COLLAPSED_PATIENT'
  } as const;
  
  // Existing Trauma Types
  export const TraumaType = {
    GSW: 'GSW',
    LADDER_FALL: 'LADDER_FALL',
    CAR_ACCIDENT: 'CAR_ACCIDENT'
  } as const;
  
  export const GSWLocation = {
    CHEST: 'CHEST',
    ABDOMEN: 'ABDOMEN',
    ARM: 'ARM'
  } as const;
  
  export const AVPULevel = {
    ALERT: 'ALERT',
    VERBAL: 'VERBAL',
    PAIN: 'PAIN',
    UNRESPONSIVE: 'UNRESPONSIVE'
  } as const;
  
  // 3. PATIENT STATE
  export interface PatientState {
    age: number;
    sex: string;
    
    // High Level Call Info (NEW)
    callType: string | null;     
    
    // Specific Incident Types (NEW & EXISTING)
    medicalType: string | null; 
    traumaType: string | null;  
    
    // Specific Trauma Details
    gswLocation: string | null;
  
    // Clinical Status
    avpuStatus: string | null;
    airwayPatent: boolean;
    isBreathingAdequate: boolean;
    hasPulse: boolean;
    isInShock: boolean;
  
    // History & Logs
    interventions: string[];
    treatmentsApplied: string[];
  }
  
  // 4. ACTIONS
  export type PatientAction =
    | { type: 'SET_CALL_TYPE'; payload: string }    // NEW
    | { type: 'SET_MEDICAL_TYPE'; payload: string } // NEW
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
  
  // 5. TOOLBOX INTERFACE
  export interface SimulationToolbox {
    addMessage: (text: string, type?: string, delay?: number) => Promise<void>;
    addHeader: (text: string) => Promise<void>;
    addSystem: (text: string) => Promise<void>;
    addTreatment?: (text: string) => Promise<void>;
    addEMT: (text: string) => Promise<void>;
    addCritical: (text: string) => Promise<void>;
    addDim: (text: string) => Promise<void>;
    getUserInput: (prompt: string, options: string[]) => Promise<string>;
    waitForContinue: () => Promise<void>;
    dispatch: React.Dispatch<PatientAction>;
    getPatient: () => PatientState;
  }