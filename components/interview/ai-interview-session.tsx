"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Square,
  SkipForward,
  Clock,
  Save,
  Maximize2,
  MessageSquare,
  ChevronRight,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { aiResponses } from "@/lib/mock-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface TranscriptEntry {
  id: string;
  speaker: "ai" | "candidate";
  text: string;
  timestamp: Date;
}

export function AIInterviewSession() {
  const router = useRouter();
  const {
    session,
    candidate,
    goToNextQuestion,
    submitAnswer,
    endSession,
    setStep,
  } = useInterviewStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [confidence, setConfidence] = useState(75);
  const [attentionStatus, setAttentionStatus] = useState<"focused" | "distracted" | "neutral">("focused");
  const [audioLevel, setAudioLevel] = useState<number[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveCaption, setLiveCaption] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef(false);
  const isMutedRef = useRef(false);

  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const progress = session
    ? ((session.currentQuestionIndex + 1) / session.questions.length) * 100
    : 0;

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to get a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google")
    ) || voices.find((v) => v.lang.startsWith("en"));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setAiSpeaking(true);
    utterance.onend = () => setAiSpeaking(false);
    utterance.onerror = () => setAiSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Initialize camera and microphone
  useEffect(() => {
    const initMediaDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio analysis for real audio levels
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initMediaDevices();

    return () => {
      // Cleanup media stream on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Setup speech recognition - only once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Update live caption with interim results
      setLiveCaption(interimTranscript);

      // Add final transcript to current answer
      if (finalTranscript) {
        setCurrentAnswer((prev) => prev + finalTranscript);
        setLiveCaption("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        console.error("Microphone access denied");
      }
    };

    recognition.onend = () => {
      // Restart if still recording using refs for current state
      if (isRecordingRef.current && !isMutedRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty deps - only run once

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      setQuestionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Real audio level visualization from microphone
  useEffect(() => {
    if (!analyserRef.current) {
      // Fallback to simulated if no analyser
      const interval = setInterval(() => {
        if (isRecording || aiSpeaking) {
          setAudioLevel(Array.from({ length: 8 }, () => Math.random() * 100));
        } else {
          setAudioLevel(Array.from({ length: 8 }, () => 10));
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyser.getByteFrequencyData(dataArray);
        // Sample 8 points from the frequency data
        const levels: number[] = [];
        const step = Math.floor(dataArray.length / 8);
        for (let i = 0; i < 8; i++) {
          levels.push((dataArray[i * step] / 255) * 100);
        }
        setAudioLevel(levels);
      }
      requestAnimationFrame(updateAudioLevel);
    };

    const animationId = requestAnimationFrame(updateAudioLevel);
    return () => cancelAnimationFrame(animationId);
  }, [isRecording, aiSpeaking]);

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus("saving");
      setTimeout(() => setAutoSaveStatus("saved"), 1000);
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Initial AI greeting
  useEffect(() => {
    if (currentQuestion && transcript.length === 0) {
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        const greeting = `Hello ${candidate?.fullName || "there"}! Let me ask you the first question. ${currentQuestion.question}`;
        setTranscript([
          {
            id: "initial",
            speaker: "ai",
            text: currentQuestion.question,
            timestamp: new Date(),
          },
        ]);
        speakText(greeting);
      }, 2000);
    }
  }, [currentQuestion, transcript.length, candidate?.fullName, speakText]);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleStartAnswer = useCallback(() => {
    setIsRecording(true);
    isRecordingRef.current = true;
    setQuestionTime(0);
    setCurrentAnswer("");
    setLiveCaption("");

    // Start speech recognition
    if (recognitionRef.current && !isMutedRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Combine current answer with any remaining live caption
    const fullAnswer = (currentAnswer + " " + liveCaption).trim() || "No verbal response recorded";
    setLiveCaption("");

    // Add candidate response to transcript
    const candidateResponse: TranscriptEntry = {
      id: `answer-${Date.now()}`,
      speaker: "candidate",
      text: fullAnswer,
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, candidateResponse]);

    // Submit answer to store
    if (currentQuestion) {
      submitAnswer({
        questionId: currentQuestion.id,
        answer: fullAnswer,
        duration: questionTime,
        confidence,
        timestamp: new Date(),
      });
    }

    // Reset current answer for next question
    setCurrentAnswer("");

    // Simulate AI processing
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setTranscript((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          speaker: "ai",
          text: aiResponse,
          timestamp: new Date(),
        },
      ]);
      speakText(aiResponse);

      // Move to next question
      setTimeout(() => {
        if (session && session.currentQuestionIndex < session.questions.length - 1) {
          goToNextQuestion();
          setQuestionTime(0);

          // Show next question
          setTimeout(() => {
            const nextQuestion = session.questions[session.currentQuestionIndex + 1];
            setTranscript((prev) => [
              ...prev,
              {
                id: `question-${Date.now()}`,
                speaker: "ai",
                text: nextQuestion.question,
                timestamp: new Date(),
              },
            ]);
            speakText(nextQuestion.question);
          }, 1500);
        } else {
          // Interview complete, go to coding
          setStep("coding");
          router.push("/interview/coding");
        }
      }, 2000);
    }, 2000);
  }, [currentQuestion, questionTime, confidence, submitAnswer, session, goToNextQuestion, setStep, router, speakText, currentAnswer, liveCaption]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted; // Toggle: if currently muted, enable; if not muted, disable
      });
    }

    // Handle speech recognition
    if (!isMuted && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (isMuted && recognitionRef.current && isRecordingRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    isMutedRef.current = newMutedState;
  }, [isMuted]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff; // Toggle: if currently off, enable; if on, disable
      });
    }
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  const handleSkipQuestion = useCallback(() => {
    if (session && session.currentQuestionIndex < session.questions.length - 1) {
      goToNextQuestion();
      setQuestionTime(0);
      setIsRecording(false);
      isRecordingRef.current = false;
      setCurrentAnswer("");
      setLiveCaption("");
      window.speechSynthesis.cancel();

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Show next question
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        const nextQuestion = session.questions[session.currentQuestionIndex + 1];
        setTranscript((prev) => [
          ...prev,
          {
            id: `question-${Date.now()}`,
            speaker: "ai",
            text: nextQuestion.question,
            timestamp: new Date(),
          },
        ]);
        speakText(nextQuestion.question);
      }, 1500);
    }
  }, [session, goToNextQuestion, speakText]);

  const handleEndInterview = () => {
    endSession();
    setStep("summary");
    router.push("/interview/summary");
  };

  if (!session || !candidate || !currentQuestion) {
    router.push("/interview");
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <div className="glass flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">InterviewAI</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTime)}
          </Badge>
          <Badge
            variant={attentionStatus === "focused" ? "default" : "secondary"}
            className="gap-1"
          >
            {attentionStatus === "focused" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {attentionStatus.charAt(0).toUpperCase() + attentionStatus.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4" />
            {autoSaveStatus === "saving" && "Saving..."}
            {autoSaveStatus === "saved" && "Saved"}
            {autoSaveStatus === "idle" && "Auto-save on"}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interview Progress</span>
          <span className="font-medium text-foreground">
            Question {session.currentQuestionIndex + 1} of {session.questions.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - AI Interviewer */}
        <div className="flex w-1/2 flex-col border-r border-border">
          {/* AI Avatar Area */}
          <div className="relative flex flex-1 flex-col items-center justify-center bg-card p-8">
            {/* AI Avatar */}
            <motion.div
              animate={{
                scale: aiSpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: aiSpeaking ? Infinity : 0,
              }}
              className={`relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent ${
                aiSpeaking ? "ai-pulse" : ""
              }`}
            >
              <Brain className="h-20 w-20 text-white" />

              {/* Speaking Indicator */}
              {aiSpeaking && (
                <motion.div
                  className="absolute -bottom-2 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {audioLevel.slice(0, 4).map((level, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 rounded-full bg-primary"
                      animate={{
                        height: `${8 + (level / 100) * 20}px`,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* AI Status */}
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                AI Interviewer
              </h3>
              <div className="mt-2 flex items-center justify-center gap-2">
                {aiSpeaking && (
                  <Badge variant="default" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    Speaking
                  </Badge>
                )}
                {aiTyping && (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing
                  </Badge>
                )}
              </div>
            </div>

            {/* Current Question */}
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 w-full max-w-lg"
            >
              <div className="glass rounded-xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                  <Badge
                    variant={
                      currentQuestion.difficulty === "easy"
                        ? "default"
                        : currentQuestion.difficulty === "medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <p className="text-lg text-foreground">{currentQuestion.question}</p>
              </div>
            </motion.div>

            {/* Typing Indicator */}
            <AnimatePresence>
              {aiTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-1">
                    <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm">AI is processing...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confidence Indicator */}
            <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">AI Confidence:</span>
                <div className="h-2 w-24 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="font-medium text-foreground">{confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Candidate */}
        <div className="flex w-1/2 flex-col">
          {/* Candidate Video Preview */}
          <div className="relative aspect-video bg-card">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                <div className="text-center">
                  <VideoOff className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Camera Off</p>
                </div>
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1.5 text-xs text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Recording
              </div>
            )}

            {/* Audio Waveform */}
            <div className="absolute bottom-4 left-4 flex items-end gap-0.5 rounded-full bg-card/80 px-3 py-2">
              {audioLevel.map((level, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={{
                    height: `${4 + (level / 100) * 20}px`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="absolute bottom-4 right-4 rounded-full bg-card/80 px-3 py-1.5 text-sm font-medium text-foreground">
              {formatTime(questionTime)}
            </div>

            {/* Live Caption Overlay */}
            <AnimatePresence>
              {(liveCaption || (isRecording && currentAnswer)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-16 left-4 right-4 rounded-lg bg-black/80 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-sm text-white">
                    {currentAnswer && (
                      <span className="text-white/80">{currentAnswer}</span>
                    )}
                    {liveCaption && (
                      <span className="text-primary">{liveCaption}</span>
                    )}
                    {!currentAnswer && !liveCaption && isRecording && (
                      <span className="text-white/60 italic">Listening...</span>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 bg-card/50"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Transcript Panel */}
          <div className="flex flex-1 flex-col border-t border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Transcript
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="gap-1"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <span className="text-xs">{voiceEnabled ? "Voice On" : "Voice Off"}</span>
              </Button>
            </div>

            <div 
              ref={transcriptRef}
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="space-y-4">
                {transcript.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      entry.speaker === "candidate" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        entry.speaker === "ai"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {entry.speaker === "ai" ? (
                        <Brain className="h-4 w-4" />
                      ) : (
                        candidate.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2 ${
                        entry.speaker === "ai"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm">{entry.text}</p>
                      <p className="mt-1 text-xs opacity-60">
                        {entry.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-between border-t border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                onClick={toggleMicrophone}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                onClick={toggleCamera}
              >
                {isVideoOff ? (
                  <VideoOff className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button onClick={handleStartAnswer} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Answer
                </Button>
              ) : (
                <Button onClick={handleSubmitAnswer} variant="default" className="gap-2">
                  <Square className="h-4 w-4" />
                  Submit Answer
                </Button>
              )}
              <Button variant="outline" onClick={handleSkipQuestion} className="gap-2">
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
            >
              <ChevronRight className="h-4 w-4" />
              Notes
            </Button>
          </div>
        </div>
      </div>

      {/* End Interview Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview? You have completed{" "}
              {session.currentQuestionIndex + 1} of {session.questions.length}{" "}
              questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndInterview}>
              End Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
