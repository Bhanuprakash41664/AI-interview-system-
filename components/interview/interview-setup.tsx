"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Mic,
  Wifi,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
  Volume2,
  Brain,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import type { DeviceStatus } from "@/lib/types";

interface DeviceCheckItem {
  id: keyof DeviceStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}

const deviceChecks: DeviceCheckItem[] = [
  {
    id: "camera",
    label: "Camera",
    icon: Camera,
    description: "Access to camera for video interview",
  },
  {
    id: "microphone",
    label: "Microphone",
    icon: Mic,
    description: "Audio input for responses",
  },
  {
    id: "internet",
    label: "Internet Connection",
    icon: Wifi,
    description: "Stable connection required",
  },
  {
    id: "browser",
    label: "Browser Compatibility",
    icon: Monitor,
    description: "Modern browser required",
  },
];

const guidelines = [
  "Find a quiet, well-lit space for your interview",
  "Ensure your camera is at eye level",
  "Close unnecessary applications and browser tabs",
  "Have a glass of water nearby",
  "Keep your resume handy for reference",
  "Speak clearly and at a moderate pace",
];

function StatusIcon({ status }: { status: DeviceStatus[keyof DeviceStatus] }) {
  switch (status) {
    case "ready":
    case "good":
    case "compatible":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "error":
    case "not_found":
    case "poor":
    case "incompatible":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "fair":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }
}

function getStatusLabel(status: DeviceStatus[keyof DeviceStatus]): string {
  switch (status) {
    case "ready":
    case "good":
    case "compatible":
      return "Ready";
    case "error":
      return "Error";
    case "not_found":
      return "Not Found";
    case "poor":
      return "Poor";
    case "fair":
      return "Fair";
    case "incompatible":
      return "Incompatible";
    default:
      return "Checking...";
  }
}

export function InterviewSetup() {
  const router = useRouter();
  const { deviceStatus, setDeviceStatus, startSession, setStep, candidate } =
    useInterviewStore();
  const [isAllReady, setIsAllReady] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate device checks
  useEffect(() => {
    const checkDevices = async () => {
      // Simulate camera check
      setTimeout(() => {
        setDeviceStatus({ camera: "ready" });
        setCheckProgress(25);
      }, 800);

      // Simulate microphone check
      setTimeout(() => {
        setDeviceStatus({ microphone: "ready" });
        setCheckProgress(50);
      }, 1600);

      // Simulate internet check
      setTimeout(() => {
        setDeviceStatus({ internet: "good" });
        setCheckProgress(75);
      }, 2400);

      // Simulate browser check
      setTimeout(() => {
        setDeviceStatus({ browser: "compatible" });
        setCheckProgress(100);
      }, 3200);
    };

    checkDevices();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setDeviceStatus]);

  // Check if all devices are ready
  useEffect(() => {
    const allReady =
      (deviceStatus.camera === "ready") &&
      (deviceStatus.microphone === "ready") &&
      (deviceStatus.internet === "good" || deviceStatus.internet === "fair") &&
      deviceStatus.browser === "compatible";
    setIsAllReady(allReady);
  }, [deviceStatus]);

  useEffect(() => {
  if (showPreview && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current;

    videoRef.current
      .play()
      .then(() => {
        console.log("Video started");
      })
      .catch((err) => {
        console.error("Video play error:", err);
      });
  }
}, [showPreview]);

  // Start camera preview
  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log(stream,"streem");
      streamRef.current = stream;
            setShowPreview(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulate audio level visualization
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

      return () => clearInterval(interval);
    } catch {
      console.log("Could not access camera/microphone");
      setShowPreview(true); // Still show preview area with placeholder
    }
  };

  const handleStartInterview = () => {
    startSession();
    setStep("interview");
    router.push("/interview/session");
  };

  const runAllChecks = () => {
    setCheckProgress(0);
    setDeviceStatus({
      camera: "checking",
      microphone: "checking",
      internet: "checking",
      browser: "checking",
    });

    // Re-run checks
    setTimeout(() => {
      setDeviceStatus({ camera: "ready" });
      setCheckProgress(25);
    }, 500);
    setTimeout(() => {
      setDeviceStatus({ microphone: "ready" });
      setCheckProgress(50);
    }, 1000);
    setTimeout(() => {
      setDeviceStatus({ internet: "good" });
      setCheckProgress(75);
    }, 1500);
    setTimeout(() => {
      setDeviceStatus({ browser: "compatible" });
      setCheckProgress(100);
    }, 2000);
  };

  if (!candidate) {
    router.push("/interview");
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Device Checks */}
      <div className="space-y-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              System Check
            </h2>
            <span className="text-sm text-muted-foreground">
              {checkProgress}% Complete
            </span>
          </div>
          <Progress value={checkProgress} className="h-2" />
        </motion.div>

        {/* Device Status Cards */}
        <div className="space-y-3">
          {deviceChecks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass flex items-center justify-between rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <check.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{check.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {check.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {getStatusLabel(deviceStatus[check.id])}
                </span>
                <StatusIcon status={deviceStatus[check.id]} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Run Checks Button */}
        <Button
          variant="outline"
          onClick={runAllChecks}
          className="w-full gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Run All Checks Again
        </Button>
      </div>

      {/* Right Column - Preview & Guidelines */}
      <div className="space-y-6">
        {/* Camera Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass overflow-hidden rounded-2xl"
        >
          <div className="relative aspect-video bg-card">
            {showPreview ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {!streamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Camera preview unavailable
                      </p>
                    </div>
                  </div>
                )}
                {/* Audio Level Indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <div className="flex h-4 items-end gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-primary"
                        animate={{
                          height: audioLevel > i * 20 ? `${8 + i * 3}px` : "4px",
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </div>
                {/* Recording Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-destructive/20 px-3 py-1.5 text-xs text-destructive">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                  Preview
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <Camera className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">Camera preview</p>
                <Button onClick={startPreview} variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Preview
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Interview Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Interview Guidelines
          </h3>
          <ul className="space-y-3">
            {guidelines.map((guideline, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {guideline}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleStartInterview}
            disabled={!isAllReady}
            size="lg"
            className="w-full gap-2 text-lg"
          >
            <Brain className="h-5 w-5" />
            {isAllReady ? "Start Interview" : "Waiting for system check..."}
          </Button>
          {!isAllReady && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Please wait while we verify your system is ready
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
