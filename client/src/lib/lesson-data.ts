import { Question } from "@shared/schema";

export const sampleQuestions: Question[] = [
  {
    id: "colors-1",
    type: "multiple_choice",
    question: "What does 'Red' mean?",
    options: ["Vermelho", "Azul", "Verde", "Amarelo"],
    correctAnswer: "Vermelho",
    explanation: "'Red' means 'Vermelho' in Portuguese. It's the color of fire and blood."
  },
  {
    id: "colors-2",
    type: "multiple_choice",
    question: "What does 'Blue' mean?",
    options: ["Vermelho", "Azul", "Verde", "Amarelo"],
    correctAnswer: "Azul",
    explanation: "'Blue' means 'Azul' in Portuguese. It's the color of the sky and ocean."
  },
  {
    id: "family-1",
    type: "multiple_choice",
    question: "What does 'Mother' mean?",
    options: ["Mãe", "Pai", "Irmã", "Avó"],
    correctAnswer: "Mãe",
    explanation: "'Mother' means 'Mãe' in Portuguese. It refers to a female parent."
  },
  {
    id: "family-2",
    type: "multiple_choice",
    question: "What does 'Father' mean?",
    options: ["Mãe", "Pai", "Irmão", "Avô"],
    correctAnswer: "Pai",
    explanation: "'Father' means 'Pai' in Portuguese. It refers to a male parent."
  },
  {
    id: "greetings-1",
    type: "multiple_choice",
    question: "What does 'Hello' mean?",
    options: ["Olá", "Adeus", "Por favor", "Obrigado"],
    correctAnswer: "Olá",
    explanation: "'Hello' is a common greeting that means 'Olá' in Portuguese."
  },
  {
    id: "greetings-2",
    type: "multiple_choice",
    question: "How do you say 'Good morning'?",
    options: ["Good night", "Good morning", "Good evening", "Good afternoon"],
    correctAnswer: "Good morning",
    explanation: "'Good morning' is used to greet someone in the morning hours."
  }
];

export const lessonCategories = [
  {
    id: "vocabulary",
    name: "Vocabulário",
    description: "Aprenda novas palavras",
    color: "cartoon-coral",
    icon: "book"
  },
  {
    id: "grammar",
    name: "Gramática", 
    description: "Domine as regras",
    color: "cartoon-blue",
    icon: "cogs"
  },
  {
    id: "phrases",
    name: "Frases",
    description: "Conversação prática", 
    color: "cartoon-mint",
    icon: "comments"
  },
  {
    id: "pronunciation",
    name: "Pronúncia",
    description: "Fale como um nativo",
    color: "cartoon-yellow", 
    icon: "microphone"
  }
];
