import type { InterviewQuestion, CodingQuestion, InterviewResult } from "./types";

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: "q1",
    type: "behavioral",
    question: "Tell me about yourself and your experience in software development. What projects are you most proud of?",
    expectedDuration: 120,
    difficulty: "easy",
    category: "Introduction",
  },
  // {
  //   id: "q2",
  //   type: "behavioral",
  //   question: "Describe a challenging project you worked on. How did you overcome the obstacles you faced?",
  //   expectedDuration: 180,
  //   difficulty: "medium",
  //   category: "Problem Solving",
  // },
  // {
  //   id: "q3",
  //   type: "technical",
  //   question: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
  //   expectedDuration: 150,
  //   difficulty: "medium",
  //   category: "Technical Knowledge",
  // },
  // {
  //   id: "q4",
  //   type: "situational",
  //   question: "How would you handle a situation where a team member is consistently missing deadlines?",
  //   expectedDuration: 120,
  //   difficulty: "medium",
  //   category: "Teamwork",
  // },
  {
    id: "q5",
    type: "technical",
    question: "What are the key principles of clean code? Can you give examples of how you apply them?",
    expectedDuration: 180,
    difficulty: "medium",
    category: "Best Practices",
  },
  // {
  //   id: "q6",
  //   type: "behavioral",
  //   question: "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
  //   expectedDuration: 150,
  //   difficulty: "easy",
  //   category: "Learning Ability",
  // },
  // {
  //   id: "q7",
  //   type: "technical",
  //   question: "Explain the concept of state management in React. What approaches have you used?",
  //   expectedDuration: 180,
  //   difficulty: "hard",
  //   category: "Frontend",
  // },
  // {
  //   id: "q8",
  //   type: "situational",
  //   question: "How would you prioritize features if you had limited time before a product launch?",
  //   expectedDuration: 150,
  //   difficulty: "hard",
  //   category: "Decision Making",
  // },
  {
    id: "q9",
    type: "technical",
    question: "What security considerations do you keep in mind when building web applications?",
    expectedDuration: 180,
    difficulty: "hard",
    category: "Security",
  },
  {
    id: "q10",
    type: "behavioral",
    question: "Where do you see yourself in 5 years? What are your career goals?",
    expectedDuration: 120,
    difficulty: "easy",
    category: "Career Goals",
  },
];

export const mockCodingQuestion: CodingQuestion = {
  id: "coding1",
  title: "Two Sum",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  difficulty: "easy",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  starterCode: {
    javascript: `function twoSum(nums, target) {
  // Your code here
  
}`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
  
}`,
    python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`,
  },
  testCases: [
    { input: "[2,7,11,15], 9", expectedOutput: "[0,1]", isHidden: false },
    { input: "[3,2,4], 6", expectedOutput: "[1,2]", isHidden: false },
    { input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: false },
    { input: "[1,2,3,4,5], 9", expectedOutput: "[3,4]", isHidden: true },
    { input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]", isHidden: true },
  ],
};

export const mockInterviewResult: InterviewResult = {
  sessionId: "session-001",
  candidateId: "candidate-001",
  overallScore: 78,
  questionsAttempted: 10,
  totalQuestions: 10,
  totalDuration: 2850,
  strengths: [
    "Strong communication skills",
    "Good technical knowledge in frontend development",
    "Demonstrated problem-solving ability",
    "Clear understanding of software architecture",
  ],
  improvements: [
    "Could elaborate more on system design concepts",
    "Consider providing more specific examples",
    "Deeper knowledge of backend technologies recommended",
  ],
  categoryScores: [
    { category: "Technical Knowledge", score: 85, maxScore: 100 },
    { category: "Problem Solving", score: 80, maxScore: 100 },
    { category: "Communication", score: 90, maxScore: 100 },
    { category: "Teamwork", score: 75, maxScore: 100 },
    { category: "Cultural Fit", score: 70, maxScore: 100 },
  ],
  recommendation: "hire",
  aiNotes: "The candidate demonstrated strong technical aptitude and excellent communication skills throughout the interview. They provided thoughtful responses to behavioral questions and showed genuine enthusiasm for the role. While there is room for growth in system design concepts, overall performance indicates they would be a valuable addition to the team.",
};

export const roleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX Designer",
  "QA Engineer",
  "Mobile Developer",
];

export const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior (5-8 years)" },
  { value: "lead", label: "Lead/Principal (8+ years)" },
];

export const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "REST APIs",
  "Git",
  "CI/CD",
  "Agile",
];

export const aiResponses = [
  "Thank you for that response. Let me process your answer...",
  "Interesting perspective. I'd like to explore that further...",
  "That's a thoughtful answer. Moving on to the next question...",
  "I appreciate your detailed explanation. Let's continue...",
  "Great example! This helps me understand your experience better...",
];
