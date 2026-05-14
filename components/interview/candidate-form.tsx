"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Briefcase,
  FileText,
  Upload,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Brain,
  ChevronRight,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { roleOptions, experienceLevels, commonSkills } from "@/lib/mock-data";
import type { Candidate } from "@/lib/types";

const candidateSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  roleApplied: z.string().min(1, "Please select a role"),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Experience", icon: Briefcase },
  { id: 3, name: "Skills & Resume", icon: FileText },
];

export function CandidateDetailsForm() {
  const router = useRouter();
  const { setCandidate, setStep } = useInterviewStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      roleApplied: "",
      experienceLevel: "mid",
      skills: [],
    },
  });

  const watchedRole = watch("roleApplied");
  const watchedExperience = watch("experienceLevel");

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue("skills", newSkills, {
  shouldValidate: true,
  shouldDirty: true,
});
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setResumeFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof CandidateFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["fullName", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["roleApplied", "experienceLevel"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: CandidateFormData) => {
    const candidate: Candidate = {
      id: `candidate-${Date.now()}`,
      ...data,
      resumeFileName: resumeFile?.name,
    };
    setCandidate(candidate);
    setStep("setup");
    router.push("/interview/setup");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor:
                      currentStep >= step.id
                        ? "var(--primary)"
                        : "var(--secondary)",
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    currentStep >= step.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 hidden h-0.5 w-16 sm:block md:w-24">
                  <div
                    className={`h-full transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <motion.div
        layout
        className="glass overflow-hidden rounded-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Personal Information
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...register("fullName")}
                      className="h-12"
                    />
                    {errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.fullName.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("email")}
                      className="h-12"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Experience Details
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Role Applied For
                    </Label>
                    <Select
                      value={watchedRole}
                      onValueChange={(value) => setValue("roleApplied", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roleApplied && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.roleApplied.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      Experience Level
                    </Label>
                    <Select
                      value={watchedExperience}
                      onValueChange={(value) =>
                        setValue("experienceLevel", value as Candidate["experienceLevel"])
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Skills & Resume */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Skills & Resume
                </h2>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Select Your Skills
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {commonSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={
                            selectedSkills.includes(skill) ? "default" : "outline"
                          }
                          className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105"
                          onClick={() => handleSkillToggle(skill)}
                        >
                          {selectedSkills.includes(skill) && (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {errors.skills && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.skills.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      Upload Resume (Optional)
                    </Label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-foreground">
                              {resumeFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(resumeFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setResumeFile(null)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop your resume here, or{" "}
                            <label className="cursor-pointer text-primary hover:underline">
                              browse
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            PDF files only, max 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-border bg-card/50 p-6">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep} className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="gap-2">
                <Brain className="h-4 w-4" />
                Start Interview
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
