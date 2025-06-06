import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle 
} from "lucide-react";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from "@/hooks/use-toast";

interface ReadingLessonProps {
  title: string;
  text: string;
  onComplete?: () => void;
}

interface WordFeedback {
  word: string;
  status: 'correct' | 'close' | 'incorrect' | 'unread';
}

export default function ReadingLesson({ title, text, onComplete }: ReadingLessonProps) {
  const [selectedText, setSelectedText] = useState("");
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordFeedback, setWordFeedback] = useState<WordFeedback[]>([]);
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoReadingSpeed, setAutoReadingSpeed] = useState(300); // milliseconds per word
  const textRef = useRef<HTMLDivElement>(null);
  const autoReadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { playText, pauseAudio, resumeAudio, stopAudio, isPlaying, isPaused: isAudioPaused } = useAudio();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported 
  } = useSpeechRecognition();

  const { toast } = useToast();

  // Initialize word feedback array
  useEffect(() => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const initialFeedback = words.map(word => ({
      word: word.replace(/[.,!?;:]/g, ''),
      status: 'unread' as const
    }));
    setWordFeedback(initialFeedback);
  }, [text]);

  // Auto-reading functionality with word tracking
  const startAutoReading = () => {
    setIsAutoReading(true);
    setIsPaused(false);
    setCurrentWordIndex(0);

    const words = text.split(/\s+/).filter(word => word.length > 0);

    // Start reading with teacher's voice
    const fullContent = `${title}. ${text}`;
    playText(fullContent);

    // Calculate timing based on speech synthesis
    const estimatedWordsPerMinute = 150; // Typical reading speed
    const msPerWord = (60 / estimatedWordsPerMinute) * 1000;

    const readNextWord = (index: number) => {
      if (index >= words.length) {
        // Reading completed
        setIsAutoReading(false);
        setCurrentWordIndex(0);
        toast({
          title: "Leitura concluída!",
          description: "Texto completo foi lido com sucesso.",
        });
        onComplete?.();
        return;
      }

      setCurrentWordIndex(index);

      // Scroll to current word if needed, considering fixed panel
      setTimeout(() => {
        const wordElement = document.querySelector(`[data-word-index="${index}"]`);
        if (wordElement) {
          const elementRect = wordElement.getBoundingClientRect();
          const panelHeight = 240; // Approximate height of fixed panel + header
          const targetY = window.scrollY + elementRect.top - panelHeight - 20;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }, 100);

      // Calculate dynamic timing based on word length and punctuation
      let wordDelay = msPerWord;
      const currentWord = words[index];
      
      // Adjust timing for punctuation and word length
      if (currentWord.match(/[.!?]$/)) {
        wordDelay += 500; // Pause longer for sentence endings
      } else if (currentWord.match(/[,;:]$/)) {
        wordDelay += 250; // Pause for commas and semicolons
      }
      
      // Adjust for word length
      if (currentWord.length > 8) {
        wordDelay += 200; // Longer words need more time
      } else if (currentWord.length <= 3) {
        wordDelay -= 100; // Short words can be faster
      }

      autoReadingTimerRef.current = setTimeout(() => {
        if (!isPaused) {
          readNextWord(index + 1);
        }
      }, Math.max(wordDelay, 200)); // Minimum 200ms per word
    };

    // Start with the title pause
    setTimeout(() => {
      readNextWord(0);
    }, 1000); // Give time for title to be read

    toast({
      title: "🎯 Professor Tommy lendo o texto",
      description: "Acompanhe as palavras destacadas em tempo real",
    });
  };

  const pauseAutoReading = () => {
    setIsPaused(true);
    if (autoReadingTimerRef.current) {
      clearTimeout(autoReadingTimerRef.current);
    }
    // Pause the audio as well
    if (isPlaying) {
      pauseAudio();
    }
    toast({
      title: "Professor Tommy pausado",
      description: "Clique em continuar para retomar",
    });
  };

  const resumeAutoReading = () => {
    if (!isAutoReading) return;

    setIsPaused(false);
    const words = text.split(/\s+/).filter(word => word.length > 0);

    // Resume audio if it was paused
    if (isAudioPaused) {
      resumeAudio();
    }

    const readNextWord = (index: number) => {
      if (index >= words.length || isPaused) {
        if (index >= words.length) {
          setIsAutoReading(false);
          setCurrentWordIndex(0);
          toast({
            title: "Leitura concluída!",
            description: "Texto completo foi lido com sucesso.",
          });
          onComplete?.();
        }
        return;
      }

      setCurrentWordIndex(index);

      setTimeout(() => {
        const wordElement = document.querySelector(`[data-word-index="${index}"]`);
        if (wordElement) {
          const elementRect = wordElement.getBoundingClientRect();
          const panelHeight = 240; // Approximate height of fixed panel + header
          const targetY = window.scrollY + elementRect.top - panelHeight - 20;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }, 100);

      autoReadingTimerRef.current = setTimeout(() => {
        if (!isPaused) {
          readNextWord(index + 1);
        }
      }, autoReadingSpeed);
    };

    readNextWord(currentWordIndex);

    toast({
      title: "🎯 Professor Tommy retomando",
      description: "Continuando de onde parou",
    });
  };

  const stopAutoReading = () => {
    setIsAutoReading(false);
    setIsPaused(false);
    setCurrentWordIndex(0);
    if (autoReadingTimerRef.current) {
      clearTimeout(autoReadingTimerRef.current);
    }
    // Stop the audio as well
    if (isPlaying || isAudioPaused) {
      stopAudio();
    }
    toast({
      title: "Professor Tommy parado",
      description: "Leitura automática foi interrompida",
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoReadingTimerRef.current) {
        clearTimeout(autoReadingTimerRef.current);
      }
    };
  }, []);

  // Função para calcular similaridade entre duas palavras
  const calculateSimilarity = (word1: string, word2: string): number => {
    const w1 = word1.toLowerCase().replace(/[.,!?;:]/g, '');
    const w2 = word2.toLowerCase().replace(/[.,!?;:]/g, '');

    if (w1 === w2) return 1;

    // Levenshtein distance simplified
    const len1 = w1.length;
    const len2 = w2.length;
    const matrix = [];

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; i <= len1; j++) {
        if (w2.charAt(i - 1) === w1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  };

  // Análise de pronuncia do transcript
  const analyzeTranscript = useCallback((transcript: string) => {
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const textWords = text.split(/\s+/).filter(word => word.length > 0);

    const newFeedback = [...wordFeedback];

    // Para cada palavra falada, encontrar a melhor correspondência no texto
    spokenWords.forEach(spokenWord => {
      let bestMatch = -1;
      let bestSimilarity = 0;

      textWords.forEach((textWord, index) => {
        const similarity = calculateSimilarity(textWord, spokenWord);
        if (similarity > bestSimilarity && similarity > 0.3) {
          bestSimilarity = similarity;
          bestMatch = index;
        }
      });

      if (bestMatch !== -1 && newFeedback[bestMatch]) {
        if (bestSimilarity >= 0.9) {
          newFeedback[bestMatch].status = 'correct';
        } else if (bestSimilarity >= 0.6) {
          newFeedback[bestMatch].status = 'close';
        } else {
          newFeedback[bestMatch].status = 'incorrect';
        }
      }
    });

    setWordFeedback(newFeedback);
  }, [text, wordFeedback]);

  // Simular progresso de leitura baseado no texto falado
  const calculateReadingProgress = useCallback((spokenText: string) => {
    const wordsInText = text.split(/\s+/).length;
    const wordsSpoken = spokenText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.min((wordsSpoken / wordsInText) * 100, 100);
  }, [text]);

  // Atualizar progresso e análise quando o transcript muda
  useEffect(() => {
    if (transcript) {
      const progress = calculateReadingProgress(transcript);
      setReadingProgress(progress);
      analyzeTranscript(transcript);
    }
  }, [transcript, calculateReadingProgress, analyzeTranscript]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedTextContent = selection.toString().trim();
      setSelectedText(selectedTextContent);

      // Get selection position to show icon
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setIconPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 5
        });
        setShowAudioIcon(true);
      }
    } else {
      setSelectedText("");
      setShowAudioIcon(false);
    }
  };

  // Handle word click for single word selection
  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Clean the word from punctuation
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    setSelectedText(cleanWord);

    // Get click position to show icon
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setIconPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 5
    });
    setShowAudioIcon(true);
  };

  const playSelectedText = (e: any) => {
    if (selectedText) {
      playText(selectedText);
      setShowAudioIcon(false);
      setSelectedText("");
      toast({
        title: "🔊 Reproduzindo seleção",
        description: "Ouvindo o texto selecionado...",
      });
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (textRef.current && !textRef.current.contains(e.target as Node)) {
      setShowAudioIcon(false);
      setSelectedText("");
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const playFullText = () => {
    const fullContent = `${title}. ${text}`;
    playText(fullContent);
    toast({
      title: "🎯 Reproduzindo texto completo",
      description: "Professor Tommy está lendo o texto...",
    });
  };

  const toggleReadingMode = () => {
    if (isReadingMode) {
      stopListening();
      setIsReadingMode(false);

      if (readingProgress >= 80) {
        toast({
          title: "🎉 Parabéns!",
          description: "Você leu o texto com sucesso!",
        });
        onComplete?.();
      }
    } else {
      if (isSupported) {
        setIsReadingMode(true);
        resetTranscript();
        setReadingProgress(0);
        startListening();
        toast({
          title: "🎤 Modo de leitura ativado",
          description: "Comece a ler o texto em voz alta...",
        });
      } else {
        toast({
          title: "❌ Recurso não disponível",
          description: "Seu navegador não suporta reconhecimento de voz.",
          variant: "destructive"
        });
      }
    }
  };

  const resetReading = () => {
    resetTranscript();
    setReadingProgress(0);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const resetFeedback = words.map(word => ({
      word: word.replace(/[.,!?;:]/g, ''),
      status: 'unread' as const
    }));
    setWordFeedback(resetFeedback);
    toast({
      title: "🔄 Leitura reiniciada",
      description: "Comece novamente a leitura do texto.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pt-20 pr-24">


      {/* Controles de Áudio e Leitura - Lateral Direita */}
      <Card className="border-2 border-cartoon-gray fixed top-20 right-4 z-50 bg-white shadow-lg w-20">
        <CardContent className="p-3">
          {/* Botões empilhados verticalmente */}
          <div className="flex flex-col gap-3">
            {/* Audio Control with Pause/Resume */}
            {!isPlaying && !isAudioPaused ? (
              <Button
                onClick={playFullText}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
              >
                <Volume2 size={20} />
              </Button>
            ) : isPlaying ? (
              <Button
                onClick={pauseAudio}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
              >
                <Pause size={20} />
              </Button>
            ) : (
              <Button
                onClick={resumeAudio}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
              >
                <Play size={20} />
              </Button>
            )}

            {(isPlaying || isAudioPaused) && (
              <Button
                onClick={stopAudio}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
              >
                <VolumeX size={20} />
              </Button>
            )}

            {/* Auto Reading Controls */}
            {!isAutoReading ? (
              <Button
                onClick={startAutoReading}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
              >
                <Play size={20} />
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    onClick={resumeAutoReading}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
                  >
                    <Play size={20} />
                  </Button>
                ) : (
                  <Button
                    onClick={pauseAutoReading}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
                  >
                    <Pause size={20} />
                  </Button>
                )}
                <Button
                  onClick={stopAutoReading}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
                >
                  <VolumeX size={20} />
                </Button>
              </>
            )}

            {/* Reading Mode Control */}
            <Button
              onClick={toggleReadingMode}
              className={`w-14 h-14 rounded-full ${
                isReadingMode 
                  ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                  : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              } text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white`}
            >
              {isReadingMode ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>

            {/* Reset Button */}
            <Button
              onClick={resetReading}
              disabled={!transcript}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white disabled:opacity-50"
            >
              <RotateCcw size={20} />
            </Button>
          </div>

          {/* Speed Control for Auto Reading */}
          {isAutoReading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-blue-700 text-center">
                  Velocidade da Marcação:
                </span>
                <div className="flex gap-1 justify-center">
                  <Button
                    onClick={() => setAutoReadingSpeed(700)}
                    variant={autoReadingSpeed === 700 ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Lenta
                  </Button>
                  <Button
                    onClick={() => setAutoReadingSpeed(500)}
                    variant={autoReadingSpeed === 500 ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Normal
                  </Button>
                  <Button
                    onClick={() => setAutoReadingSpeed(300)}
                    variant={autoReadingSpeed === 300 ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                  >
                    Rápida
                  </Button>
                </div>
                <div className="text-xs text-center text-blue-600">
                  Sincronizado com a voz do Professor Tommy
                </div>
              </div>
            </div>
          )}

          {/* Progresso da Leitura */}
          {(isReadingMode || isAutoReading) && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {isAutoReading ? "Progresso da Leitura Guiada" : "Progresso da Leitura"}
                </span>
                <span className="font-semibold text-cartoon-coral">
                  {isAutoReading ? 
                    `${Math.round((currentWordIndex / text.split(/\s+/).length) * 100)}%` :
                    `${Math.round(readingProgress)}%`
                  }
                </span>
              </div>
              <Progress 
                value={isAutoReading ? 
                  (currentWordIndex / text.split(/\s+/).length) * 100 :
                  readingProgress
                } 
                className="h-3" 
              />

              {/* Auto Reading Status */}
              {isAutoReading && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {isPaused ? (
                    <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                      <Pause size={16} />
                      Leitura pausada - Palavra {currentWordIndex + 1} de {text.split(/\s+/).length}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Play size={16} />
                      </motion.div>
                      Lendo palavra {currentWordIndex + 1} de {text.split(/\s+/).length}
                    </div>
                  )}
                </div>
              )}

              {(readingProgress >= 80 || (isAutoReading && currentWordIndex >= text.split(/\s+/).length * 0.8)) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600 font-semibold"
                >
                  <CheckCircle size={20} />
                  Excelente! Continue assim!
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de Texto */}
      <Card className="border-2 border-cartoon-gray">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="text-center">
            <CardTitle className="text-xl sm:text-2xl text-cartoon-dark">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative p-3 sm:p-6">
          <div
            ref={textRef}
            className="text-base sm:text-lg leading-relaxed p-3 sm:p-4 bg-white rounded-lg border border-gray-200 cursor-text select-text break-words whitespace-pre-wrap overflow-wrap-anywhere min-h-[200px] sm:min-h-[300px]"
            onMouseUp={handleTextSelection}
            style={{ userSelect: 'text', wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {text.split(/\s+/).map((word, index) => {
              const feedback = wordFeedback[index];
              const isCurrentWord = isAutoReading && currentWordIndex === index;
              let colorClass = '';

              // Priority: Current word highlighting > feedback status
              if (isCurrentWord) {
                colorClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-110 font-bold border-2 border-blue-300 transform';
              } else {
                switch (feedback?.status) {
                  case 'correct':
                    colorClass = 'bg-green-200 text-green-800';
                    break;
                  case 'close':
                    colorClass = 'bg-yellow-200 text-yellow-800';
                    break;
                  case 'incorrect':
                    colorClass = 'bg-red-200 text-red-800';
                    break;
                  default:
                    colorClass = 'text-gray-800';
                }
              }

              return (
                <motion.span
                  key={index}
                  data-word-index={index}
                  className={`${colorClass} px-1 py-0.5 rounded transition-all duration-300 mr-1 inline-block cursor-pointer hover:bg-blue-100`}
                  style={{ wordBreak: 'break-word' }}
                  onClick={(e) => handleWordClick(word, e)}
                  animate={isCurrentWord ? {
                    scale: [1.1, 1.15, 1.1],
                    boxShadow: [
                      '0 4px 15px rgba(59, 130, 246, 0.4)',
                      '0 6px 20px rgba(59, 130, 246, 0.6)',
                      '0 4px 15px rgba(59, 130, 246, 0.4)'
                    ]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: isCurrentWord ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </div>

          {/* Floating Audio Icon */}
          {showAudioIcon && selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                scale: {
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="fixed z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 shadow-2xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all border-2 border-white"
              style={{
                left: `${iconPosition.x - 24}px`,
                top: `${iconPosition.y}px`,
                transform: 'translateX(-50%)'
              }}
              onClick={(e) => playSelectedText(e)}
            >
              <Volume2 size={24} className="drop-shadow-sm" />
            </motion.div>
          )}

          {/* Legenda das Cores */}
          {(isReadingMode || isAutoReading) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Legenda de Cores:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {isAutoReading && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500 rounded shadow-lg"></span>
                    <span className="font-semibold">Palavra Atual</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-200 rounded"></span>
                  <span>Pronuncia Correta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-200 rounded"></span>
                  <span>Pronuncia Próxima</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-200 rounded"></span>
                  <span>Precisa Melhorar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-200 rounded"></span>
                  <span>Não Lida</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status do Microfone */}
      {isListening && (
        <Card className="border-2 border-cartoon-coral mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-cartoon-coral">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Mic size={20} />
              </motion.div>
              <span className="font-medium">Ouvindo... Leia o texto!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {transcript && (
        <Card className="border-2 border-blue-200 mt-4">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">O que você disse:</p>
            <p className="text-gray-800">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {!isSupported && (
        <Card className="border-2 border-yellow-200 mt-4">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              Reconhecimento de voz não está disponível neste navegador. 
              Recomendamos usar Chrome ou Edge para melhor experiência.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}