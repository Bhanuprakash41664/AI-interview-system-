"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Download,
  Home,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  FileText,
  BarChart3,
  User,
  Mail,
  Briefcase,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}

function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case "strong_hire":
      return "bg-green-500";
    case "hire":
      return "bg-emerald-500";
    case "maybe":
      return "bg-yellow-500";
    case "no_hire":
      return "bg-destructive";
    default:
      return "bg-muted";
  }
}

function getRecommendationText(recommendation: string): string {
  switch (recommendation) {
    case "strong_hire":
      return "Strong Hire";
    case "hire":
      return "Hire";
    case "maybe":
      return "Maybe";
    case "no_hire":
      return "No Hire";
    default:
      return "Pending";
  }
}

export function InterviewSummary() {
  const router = useRouter();
  const { candidate, result, session, resetAll } = useInterviewStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate the score
  useEffect(() => {
    if (result) {
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setAnimatedScore(Math.round(result.overallScore * progress));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [result]);

  const handleDownloadReport = () => {
    // Simulate PDF download
    alert("Report download started! (Demo)");
  };

  const handleReturnHome = () => {
    resetAll();
    router.push("/");
  };

  if (!candidate || !result) {
    router.push("/interview");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Interview<span className="text-primary">AI</span>
            </span>
          </Link>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Interview Complete
          </Badge>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Interview Complete!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Thank you for completing your interview, {candidate.fullName.split(" ")[0]}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Candidate Info & Score */}
          <div className="space-y-6">
            {/* Candidate Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Candidate Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {candidate.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {candidate.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.roleApplied}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {candidate.experienceLevel.charAt(0).toUpperCase() +
                        candidate.experienceLevel.slice(1)}{" "}
                      Level
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {candidate.skills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 5 && (
                      <Badge variant="outline">+{candidate.skills.length - 5}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Overall Score
                    </p>
                    <div className="relative my-6">
                      <svg
                        className="mx-auto h-40 w-40"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-muted"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className="text-primary"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 45 * (1 - result.overallScore / 100),
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-foreground">
                          {animatedScore}%
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`${getRecommendationColor(
                        result.recommendation
                      )} text-white`}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {getRecommendationText(result.recommendation)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Middle Column - Performance Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <Card className="glass">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Questions Attempted
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {result.questionsAttempted}/{result.totalQuestions}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatDuration(result.totalDuration)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Score per Category
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(
                        result.categoryScores.reduce((a, b) => a + b.score, 0) /
                          result.categoryScores.length
                      )}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.categoryScores.map((category, index) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {category.category}
                        </span>
                        <span className="text-muted-foreground">
                          {category.score}/{category.maxScore}
                        </span>
                      </div>
                      <Progress
                        value={(category.score / category.maxScore) * 100}
                        className="mt-2 h-2"
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Strengths & Improvements */}
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-green-600 dark:text-green-400">
                      <TrendingUp className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.strengths.map((strength, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          {strength}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="glass h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-amber-600 dark:text-amber-400">
                      <TrendingDown className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.improvements.map((improvement, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          {improvement}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AI Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Evaluation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.aiNotes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button
                onClick={handleDownloadReport}
                size="lg"
                className="flex-1 gap-2"
              >
                <Download className="h-5 w-5" />
                Download Report
              </Button>
              <Button
                onClick={handleReturnHome}
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
              >
                <Home className="h-5 w-5" />
                Return to Dashboard
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
