"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Play,
  Send,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Brain,
  Code2,
  FileText,
  Terminal,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { useTheme } from "next-themes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

interface TestResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  hidden: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function CodingInterview() {
  const router = useRouter();
  const { session, setStep, endSession } = useInterviewStore();
  const { theme } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [activeTab, setActiveTab] = useState("problem");

  const codingQuestion = session?.codingQuestion;

  // Initialize code with starter code
  useEffect(() => {
    if (codingQuestion?.starterCode[selectedLanguage]) {
      setCode(codingQuestion.starterCode[selectedLanguage]);
    }
  }, [selectedLanguage, codingQuestion]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus("saving");
      setTimeout(() => setAutoSaveStatus("saved"), 1000);
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);

    // Simulate code execution
    setTimeout(() => {
      setOutput(`> Running ${selectedLanguage} code...
> Compiling...
> Executing test cases...

Test Case 1: nums = [2,7,11,15], target = 9
Output: [0,1]

Test Case 2: nums = [3,2,4], target = 6
Output: [1,2]

Test Case 3: nums = [3,3], target = 6
Output: [0,1]

Execution completed in 42ms`);

      // Simulate test results
      if (codingQuestion) {
        const results: TestResult[] = codingQuestion.testCases
          .filter((tc) => !tc.isHidden)
          .map((tc, index) => ({
            id: index + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: tc.expectedOutput,
            passed: Math.random() > 0.2,
            hidden: tc.isHidden,
          }));
        setTestResults(results);
      }

      setIsRunning(false);
      setActiveTab("output");
    }, 2000);
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setOutput("");

    // Simulate submission
    setTimeout(() => {
      setOutput(`> Submitting solution...
> Running all test cases (including hidden)...

✓ Test Case 1: Passed
✓ Test Case 2: Passed
✓ Test Case 3: Passed
✓ Test Case 4 (Hidden): Passed
✓ Test Case 5 (Hidden): Passed

All test cases passed!
Time Complexity: O(n)
Space Complexity: O(n)

Solution accepted!`);

      if (codingQuestion) {
        const results: TestResult[] = codingQuestion.testCases.map((tc, index) => ({
          id: index + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: tc.expectedOutput,
          passed: true,
          hidden: tc.isHidden,
        }));
        setTestResults(results);
      }

      setIsSubmitting(false);
      setActiveTab("output");

      // Navigate to summary after a delay
      setTimeout(() => {
        endSession();
        setStep("summary");
        router.push("/interview/summary");
      }, 3000);
    }, 3000);
  };

  const handleResetCode = () => {
    if (codingQuestion?.starterCode[selectedLanguage]) {
      setCode(codingQuestion.starterCode[selectedLanguage]);
    }
    setOutput("");
    setTestResults([]);
  };

  if (!session || !codingQuestion) {
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
            <Code2 className="h-3 w-3" />
            Coding Challenge
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4" />
            {autoSaveStatus === "saving" && "Saving..."}
            {autoSaveStatus === "saved" && "Saved"}
            {autoSaveStatus === "idle" && "Auto-save on"}
          </div>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Problem Description */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="flex h-full flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
              <div className="border-b border-border px-4">
                <TabsList className="h-12 w-full justify-start gap-4 bg-transparent p-0">
                  <TabsTrigger
                    value="problem"
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Problem
                  </TabsTrigger>
                  <TabsTrigger
                    value="output"
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0"
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    Output
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="problem" className="mt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {/* Problem Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">
                          {codingQuestion.title}
                        </h1>
                        <Badge
                          variant={
                            codingQuestion.difficulty === "easy"
                              ? "default"
                              : codingQuestion.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {codingQuestion.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-foreground">
                        {codingQuestion.description}
                      </p>
                    </div>

                    {/* Examples */}
                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Examples
                      </h3>
                      {codingQuestion.examples.map((example, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-lg bg-secondary/50 p-4"
                        >
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">
                              Input:
                            </span>{" "}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                              {example.input}
                            </code>
                          </p>
                          <p className="mt-2 text-sm">
                            <span className="font-semibold text-foreground">
                              Output:
                            </span>{" "}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                              {example.output}
                            </code>
                          </p>
                          {example.explanation && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Explanation:</span>{" "}
                              {example.explanation}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Constraints */}
                    <div className="mt-8">
                      <h3 className="mb-3 text-lg font-semibold text-foreground">
                        Constraints
                      </h3>
                      <ul className="space-y-2">
                        {codingQuestion.constraints.map((constraint, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <ChevronRight className="h-4 w-4 text-primary" />
                            <code className="font-mono">{constraint}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="output" className="mt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {/* Console Output */}
                    <div className="rounded-lg bg-card p-4 font-mono text-sm">
                      {output ? (
                        <pre className="whitespace-pre-wrap text-foreground">
                          {output}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground">
                          Run your code to see output here...
                        </p>
                      )}
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          Test Results
                        </h3>
                        <div className="space-y-2">
                          {testResults.map((result) => (
                            <div
                              key={result.id}
                              className={`flex items-center justify-between rounded-lg p-3 ${
                                result.passed
                                  ? "bg-green-500/10"
                                  : "bg-destructive/10"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {result.passed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                                <span className="font-medium text-foreground">
                                  Test Case {result.id}
                                  {result.hidden && " (Hidden)"}
                                </span>
                              </div>
                              <Badge variant={result.passed ? "default" : "destructive"}>
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Code Editor */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="flex h-full flex-col">
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'Geist Mono', monospace",
                }}
              />
            </div>

            {/* Bottom Control Bar */}
            <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCode}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Code
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="gap-2"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Run Code
                </Button>
                <Button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Solution
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
