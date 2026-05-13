import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  AppState, 
  Candidate, 
  InterviewSession, 
  DeviceStatus, 
  InterviewResult,
  InterviewStep,
  InterviewAnswer
} from "./types";
import { mockInterviewQuestions, mockCodingQuestion, mockInterviewResult } from "./mock-data";

interface InterviewStore extends AppState {
  // Navigation
  setStep: (step: InterviewStep) => void;
  nextStep: () => void;
  
  // Candidate
  setCandidate: (candidate: Candidate) => void;
  clearCandidate: () => void;
  
  // Session
  startSession: () => void;
  endSession: () => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  submitAnswer: (answer: InterviewAnswer) => void;
  
  // Device Status
  setDeviceStatus: (status: Partial<DeviceStatus>) => void;
  
  // Results
  setResult: (result: InterviewResult) => void;
  
  // Theme
  toggleTheme: () => void;
  
  // Reset
  resetAll: () => void;
}

const stepOrder: InterviewStep[] = [
  "landing",
  "candidate_details",
  "setup",
  "interview",
  "coding",
  "summary",
];

const initialDeviceStatus: DeviceStatus = {
  camera: "checking",
  microphone: "checking",
  internet: "checking",
  browser: "unknown",
};

const initialState: AppState = {
  currentStep: "landing",
  candidate: null,
  session: null,
  deviceStatus: initialDeviceStatus,
  result: null,
  theme: "dark",
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const currentIndex = stepOrder.indexOf(get().currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },

      setCandidate: (candidate) => set({ candidate }),

      clearCandidate: () => set({ candidate: null }),

      startSession: () => {
        const candidate = get().candidate;
        if (!candidate) return;

        const session: InterviewSession = {
          id: `session-${Date.now()}`,
          candidateId: candidate.id,
          status: "in_progress",
          currentQuestionIndex: 0,
          questions: mockInterviewQuestions,
          codingQuestion: mockCodingQuestion,
          startTime: new Date(),
          answers: [],
        };

        set({ session });
      },

      endSession: () => {
        const session = get().session;
        if (!session) return;

        set({
          session: {
            ...session,
            status: "completed",
            endTime: new Date(),
          },
          result: {
            ...mockInterviewResult,
            sessionId: session.id,
            candidateId: session.candidateId,
          },
        });
      },

      goToNextQuestion: () => {
        const session = get().session;
        if (!session) return;

        const nextIndex = session.currentQuestionIndex + 1;
        if (nextIndex < session.questions.length) {
          set({
            session: {
              ...session,
              currentQuestionIndex: nextIndex,
            },
          });
        }
      },

      goToPreviousQuestion: () => {
        const session = get().session;
        if (!session) return;

        const prevIndex = session.currentQuestionIndex - 1;
        if (prevIndex >= 0) {
          set({
            session: {
              ...session,
              currentQuestionIndex: prevIndex,
            },
          });
        }
      },

      submitAnswer: (answer) => {
        const session = get().session;
        if (!session) return;

        set({
          session: {
            ...session,
            answers: [...session.answers, answer],
          },
        });
      },

      setDeviceStatus: (status) =>
        set((state) => ({
          deviceStatus: { ...state.deviceStatus, ...status },
        })),

      setResult: (result) => set({ result }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      resetAll: () => set(initialState),
    }),
    {
      name: "interview-store",
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
