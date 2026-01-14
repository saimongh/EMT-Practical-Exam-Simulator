# ⚕️ EMT Primary Assessment Simulator

## 🔗 Try Live Demo!

**Experience the simulation immediately:** [https://emt-practical-exam-simulator.vercel.app/](https://emt-practical-exam-simulator.vercel.app/)

---

## 🚀 Project Overview

This is an interactive, text-based simulation built to guide a user through the **Primary Assessment** and **Rapid Trauma Assessment** steps according to standardized Emergency Medical Technician (EMT) protocols.

The simulator tracks a virtual **Patient State** (e.g., AVPU, Shock Status, Interventions) and forces the user to make critical, sequential decisions, providing immediate feedback (CRITICAL/SYSTEM messages) to mimic the pressure and real-time decision-making required during an emergency call.

## ✨ Why I Built This

I created the EMT Primary Assessment Simulator to serve as a focused, hands-on study tool for my **EMT practical skills examination**.

The primary goal is to master and memorize the exact sequence, decision logic, and appropriate verbalizations for crucial protocols, including:

- **Scene Size-Up** and **LISA** steps.
- **Airway Management** (OPA/NPA insertion and tolerance checks).
- **Shock Assessment** and appropriate field interventions.
- **Load-and-Go** vs. **Stay-and-Play** transport decisions.
- **Rapid Trauma Assessment** (Head-to-toe and pelvis checks).

By forcing me to code the decision pathways, I am internalizing the complex algorithms required to pass the hands-on practical exam.

## 💻 Current Features and Implemented Steps

The current simulation successfully guides the user through the **Trauma Protocol** with a focus on a **Gunshot Wound (GSW) scenario**.

| Step         | Protocol Area                           | Status   | Key Features Implemented                                                                                       |
| :----------- | :-------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| **Preamble** | Call & Trauma Type Selection            | Complete | Determines scenario path.                                                                                      |
| **Step 1-3** | Scene Size-up, LISA, Spinal Precautions | Complete | Confirms safety, MOI, and C-spine control.                                                                     |
| **Step 4**   | AVPU Assessment                         | Complete | Logic for Alert, Verbal, Pain, Unresponsive (including initial CPR check).                                     |
| **Step 5**   | Airway Management                       | Complete | Suctioning/clearance, OPA/NPA tolerance logic.                                                                 |
| **Step 6**   | Oxygen & Breathing                      | Complete | **Looping logic** to re-assess breathing after intervention until successful.                                  |
| **Step 7**   | Circulation & Shock                     | Complete | Full assessment of pulse, skin, and conjunctiva to definitively diagnose shock.                                |
| **Step 8**   | Transport Decision                      | Complete | **Critical:** Triggers "Load-and-Go" if shock is detected, bypassing stale state issues.                       |
| **Step 9**   | Rapid Trauma Assessment                 | Complete | Head-to-toe check, includes conditional **pelvis stabilization logic** (skipping genitalia check if unstable). |
| **Step 10**  | Reassessment & Summary                  | Complete | Final patient state and intervention log display.                                                              |

## 🚧 Roadmap and Incomplete Branches

This project is under continuous development. The following sections are currently placeholders or have limited functionality:

1.  **Medical Protocol:** Currently incomplete. The simulator does not yet contain the full assessment pathway for medical calls (e.g., cardiac, diabetic, respiratory complaints).
2.  **Specific Trauma Branches:** Trauma types other than GSW (e.g., **Ladder Fall**, **Car Accident**) are currently placeholders and require unique assessment logic (e.g., full spinal immobilization considerations).
3.  **Detailed Vitals & Reassessment:** Future updates will include vital sign input and tracking over time to influence treatment decisions.

## ⚙️ Technologies Used

- **Front-end:** React (Next.js)
- **State Management:** `useReducer` hook
- **Language:** TypeScript/JavaScript (TSX)

## 💡 How to Run Locally

1.  Clone the repository:
    ```bash
    git clone [https://github.com/saimongh/EMT-Practical-Exam-Simulator.git](https://github.com/saimongh/EMT-Practical-Exam-Simulator.git)
    ```
2.  Navigate to the project directory:
    ```bash
    cd EMT-Practical-Exam-Simulator
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the local server:
    ```bash
    npm run dev
    ```
5.  Open your browser to `http://localhost:3000` (or the port indicated in your terminal).
