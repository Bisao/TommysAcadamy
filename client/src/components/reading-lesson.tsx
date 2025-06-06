
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
  onControlsReady?: (controls: React.ReactNode) => void;
}

interface WordFeedback {
  word: string;
  status: 'correct' | 'close' | 'incorrect' | 'unread';
}

export default function ReadingLesson({ title, text, onComplete, onControlsReady }: ReadingLessonProps) {
  const [selectedText, setSelectedText] = useState("");
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordFeedback, setWordFeedback] = useState<WordFeedback[]>([]);
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Iniciar pausado
  const textRef = useRef<HTMLDivElement>(null);
  const autoReadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { playText, pauseAudio, resumeAudio, stopAudio, isPlaying, isPaused: isAudioPaused, currentUtterance } = useAudio();
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
    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const textWords = text.split(/\s+/).filter(word => word.length > 0);
    const allWords = [...titleWords, ...textWords];
    const initialFeedback = allWords.map(word => ({
      word: word.replace(/[.,!?;:]/g, ''),
      status: 'unread' as const
    }));
    setWordFeedback(initialFeedback);
  }, [title, text]);

  const startAutoReading = useCallback(() => {
    setIsAutoReading(true);
    setIsPaused(false);
    setCurrentWordIndex(0);

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const fullContent = `${title}. ${text}`;

    const handleWordBoundary = (word: string, index: number) => {
      const totalTitleWords = titleWords.length;

      if (index <= totalTitleWords) {
        setCurrentWordIndex(0);
      } else {
        const textWordIndex = index - totalTitleWords - 1;
        if (textWordIndex >= 0 && textWordIndex < words.length) {
          setCurrentWordIndex(textWordIndex);

          if (textWordIndex >= words.length - 1) {
            setTimeout(() => {
              setIsAutoReading(false);
              setIsPaused(false);
              setCurrentWordIndex(0);
              toast({
                title: "🎉 Leitura concluída!",
                description: "Professor Tommy terminou de ler o texto.",
              });
            }, 1000);
          }

          setTimeout(() => {
            const wordElement = document.querySelector(`[data-word-index="${textWordIndex}"]`);
            if (wordElement) {
              const elementRect = wordElement.getBoundingClientRect();
              const headerHeight = window.innerWidth < 640 ? 60 : 80;
              const audioBarHeight = window.innerWidth < 640 ? 100 : 120;
              const totalOffset = headerHeight + audioBarHeight + 20;
              const targetY = window.scrollY + elementRect.top - totalOffset;

              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      }
    };

    setTimeout(() => {
      setCurrentWordIndex(0);
    }, 100);

    playText(fullContent, "en-US", 0, handleWordBoundary);

    toast({
      title: "🎯 Professor Tommy lendo o texto",
      description: "Acompanhe as palavras destacadas em tempo real",
    });
  }, [title, text, playText, toast]);

  const pauseAutoReading = useCallback(() => {
    setIsPaused(true);
    if (isPlaying) {
      pauseAudio();
    }
    toast({
      title: "Professor Tommy pausado",
      description: "Clique em continuar para retomar",
    });
  }, [isPlaying, pauseAudio, toast]);

  const resumeAutoReading = useCallback(async () => {
    if (!isAutoReading) return;
    
    if (isPaused && speechSynthesis.paused && speechSynthesis.speaking && currentUtterance) {
      try {
        resumeAudio();
        setIsPaused(false);
        toast({
          title: "🎯 Professor Tommy retomando",
          description: "Continuando de onde parou",
        });
        return;
      } catch (error) {
        console.warn("Erro ao retomar áudio:", error);
        stopAudio();
      }
    }
    
    setIsPaused(false);
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    if (currentWordIndex >= words.length - 1) {
      setIsAutoReading(false);
      setIsPaused(false);
      setCurrentWordIndex(0);
      toast({
        title: "🎉 Leitura já foi concluída!",
        description: "Use o botão de play para reiniciar.",
      });
      return;
    }
    
    const startIndex = Math.max(0, currentWordIndex);
    const remainingWords = words.slice(startIndex);
    const remainingText = remainingWords.join(' ');
    
    if (remainingText.trim()) {
      const handleWordBoundary = (word: string, index: number) => {
        const adjustedIndex = startIndex + index;
        if (adjustedIndex >= 0 && adjustedIndex < words.length) {
          setCurrentWordIndex(adjustedIndex);

          if (adjustedIndex >= words.length - 1) {
            setTimeout(() => {
              setIsAutoReading(false);
              setIsPaused(false);
              setCurrentWordIndex(0);
              toast({
                title: "🎉 Leitura concluída!",
                description: "Professor Tommy terminou de ler o texto.",
              });
            }, 1000);
          }

          setTimeout(() => {
            const wordElement = document.querySelector(`[data-word-index="${adjustedIndex}"]`);
            if (wordElement) {
              const elementRect = wordElement.getBoundingClientRect();
              const headerHeight = window.innerWidth < 640 ? 60 : 80;
              const audioBarHeight = window.innerWidth < 640 ? 100 : 120;
              const totalOffset = headerHeight + audioBarHeight + 20;
              const targetY = window.scrollY + elementRect.top - totalOffset;

              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      };

      await playText(remainingText, "en-US", 0, handleWordBoundary);
      
      toast({
        title: "🎯 Professor Tommy retomando",
        description: "Continuando de onde parou",
      });
    }
  }, [isAutoReading, isPaused, isAudioPaused, currentWordIndex, text, playText, resumeAudio, toast, currentUtterance, stopAudio]);

  const stopAutoReading = useCallback(() => {
    setIsAutoReading(false);
    setIsPaused(true); // Voltar para pausado
    setCurrentWordIndex(0);
    if (autoReadingTimerRef.current) {
      clearTimeout(autoReadingTimerRef.current);
    }
    if (isPlaying || isAudioPaused) {
      stopAudio();
    }
    toast({
      title: "Professor Tommy parado",
      description: "Leitura automática foi interrompida",
    });
  }, [isPlaying, isAudioPaused, stopAudio, toast]);

  const toggleReadingMode = useCallback(() => {
    if (isReadingMode) {
      stopListening();
      setIsReadingMode(false);

      if (readingProgress >= 80) {
        toast({
          title: "🎉 Parabéns!",
          description: "Você leu o texto com sucesso!",
        });
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
  }, [isReadingMode, readingProgress, isSupported, stopListening, resetTranscript, startListening, toast]);

  const resetReading = useCallback(() => {
    resetTranscript();
    setReadingProgress(0);
    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const textWords = text.split(/\s+/).filter(word => word.length > 0);
    const allWords = [...titleWords, ...textWords];
    const resetFeedback = allWords.map(word => ({
      word: word.replace(/[.,!?;:]/g, ''),
      status: 'unread' as const
    }));
    setWordFeedback(resetFeedback);
    toast({
      title: "🔄 Leitura reiniciada",
      description: "Comece novamente a leitura do texto.",
    });
  }, [title, text, resetTranscript, toast]);

  const createAudioControls = useCallback(() => (
    <div className="flex items-center gap-1 sm:gap-2">
      {!isAutoReading || isPaused ? (
        <Button
          onClick={!isAutoReading ? startAutoReading : resumeAutoReading}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title={!isAutoReading ? "Iniciar leitura guiada" : "Continuar leitura guiada"}
        >
          <Play size={14} className="sm:w-4 sm:h-4" />
        </Button>
      ) : (
        <Button
          onClick={pauseAutoReading}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Pausar leitura guiada"
        >
          <Pause size={14} className="sm:w-4 sm:h-4" />
        </Button>
      )}

      {isAutoReading && (
        <Button
          onClick={stopAutoReading}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Parar leitura guiada"
        >
          <VolumeX size={14} className="sm:w-4 sm:h-4" />
        </Button>
      )}

      <Button
        onClick={toggleReadingMode}
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
          isReadingMode 
            ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
            : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
        title={isReadingMode ? "Parar reconhecimento" : "Iniciar reconhecimento de voz"}
      >
        {isReadingMode ? <MicOff size={14} className="sm:w-4 sm:h-4" /> : <Mic size={14} className="sm:w-4 sm:h-4" />}
      </Button>

      <Button
        onClick={resetReading}
        disabled={!transcript}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        title="Reiniciar leitura"
      >
        <RotateCcw size={14} className="sm:w-4 sm:h-4" />
      </Button>
    </div>
  ), [isAutoReading, isPaused, isReadingMode, transcript, startAutoReading, resumeAutoReading, pauseAutoReading, stopAutoReading, toggleReadingMode, resetReading]);

  // Pass audio controls to parent component
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(createAudioControls());
    }
  }, [createAudioControls, onControlsReady]);

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
      for (let j = 1; j <= len1; j++) {
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
    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const textWords = text.split(/\s+/).filter(word => word.length > 0);
    const allWords = [...titleWords, ...textWords];

    setWordFeedback(prevFeedback => {
      const newFeedback = [...prevFeedback];

      spokenWords.forEach(spokenWord => {
        let bestMatch = -1;
        let bestSimilarity = 0;

        allWords.forEach((word, index) => {
          const similarity = calculateSimilarity(word, spokenWord);
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

      return newFeedback;
    });
  }, [title, text]);

  // Simular progresso de leitura baseado no texto falado
  const calculateReadingProgress = useCallback((spokenText: string) => {
    const titleWords = title.split(/\s+/).length;
    const textWords = text.split(/\s+/).length;
    const totalWords = titleWords + textWords;
    const wordsSpoken = spokenText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.min((wordsSpoken / totalWords) * 100, 100);
  }, [title, text]);

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

  const handleWordClick = (word: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const cleanWord = word.replace(/[.,!?;:]/g, '');
    setSelectedText(cleanWord);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    setIconPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + (isMobile ? 10 : 5)
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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (autoReadingTimerRef.current) {
        clearTimeout(autoReadingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pt-20">
      {/* Área de Texto */}
      <Card className="border-2 border-cartoon-gray">
        <CardContent className="relative p-3 sm:p-6">
          <div
            ref={textRef}
            className="text-base sm:text-lg leading-relaxed p-3 sm:p-4 bg-white dark:bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-300 cursor-text select-text break-words whitespace-pre-wrap overflow-wrap-anywhere min-h-[200px] sm:min-h-[300px]"
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
            style={{ 
              userSelect: 'text', 
              wordBreak: 'break-word', 
              overflowWrap: 'break-word',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'text'
            }}
          >
            {/* Título integrado ao texto */}
            <div className="mb-4 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-cartoon-dark mb-3">
                {title.split(/\s+/).map((word, index) => {
                  const isCurrentWord = isAutoReading && currentWordIndex === index;
                  const feedback = wordFeedback[index];
                  let colorClass = '';

                  if (isCurrentWord) {
                    colorClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg sm:shadow-xl scale-105 sm:scale-110 font-bold border-2 border-blue-300 transform animate-pulse';
                  } else {
                    switch (feedback?.status) {
                      case 'correct':
                        colorClass = 'bg-green-200 dark:bg-green-300 text-green-800 dark:text-green-900 border border-green-300 dark:border-green-400';
                        break;
                      case 'close':
                        colorClass = 'bg-yellow-200 dark:bg-yellow-300 text-yellow-800 dark:text-yellow-900 border border-yellow-300 dark:border-yellow-400';
                        break;
                      case 'incorrect':
                        colorClass = 'bg-red-200 dark:bg-red-300 text-red-800 dark:text-red-900 border border-red-300 dark:border-red-400';
                        break;
                      default:
                        colorClass = 'text-gray-800 dark:text-gray-700 hover:bg-blue-50 dark:hover:bg-blue-100';
                    }
                  }

                  return (
                    <span
                      key={`title-${index}`}
                      data-word-index={index}
                      className={`${colorClass} px-1 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all duration-200 mr-1 sm:mr-2 mb-1 inline-block cursor-pointer touch-manipulation select-none min-h-[28px] sm:min-h-[32px] flex items-center justify-center text-center`}
                      style={{ 
                        wordBreak: 'break-word', 
                        userSelect: 'none',
                        minWidth: '20px',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                      onClick={(e) => handleWordClick(word, e)}
                      onTouchStart={(e) => e.preventDefault()}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleWordClick(word, e);
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </h2>
            </div>

            {/* Texto principal */}
            <div className="text-justify leading-relaxed">
              {text.split(/\s+/).map((word, textIndex) => {
                const titleWordsCount = title.split(/\s+/).length;
                const globalIndex = titleWordsCount + textIndex;
                const feedback = wordFeedback[globalIndex];
                const isCurrentWord = isAutoReading && currentWordIndex === globalIndex;
                let colorClass = '';

                if (isCurrentWord) {
                  colorClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg sm:shadow-xl scale-105 sm:scale-110 font-bold border-2 border-blue-300 transform animate-pulse';
                } else {
                  switch (feedback?.status) {
                    case 'correct':
                      colorClass = 'bg-green-200 dark:bg-green-300 text-green-800 dark:text-green-900 border border-green-300 dark:border-green-400';
                      break;
                    case 'close':
                      colorClass = 'bg-yellow-200 dark:bg-yellow-300 text-yellow-800 dark:text-yellow-900 border border-yellow-300 dark:border-yellow-400';
                      break;
                    case 'incorrect':
                      colorClass = 'bg-red-200 dark:bg-red-300 text-red-800 dark:text-red-900 border border-red-300 dark:border-red-400';
                      break;
                    default:
                      colorClass = 'text-gray-800 dark:text-gray-700 hover:bg-blue-50 dark:hover:bg-blue-100';
                  }
                }

                return (
                  <span
                    key={`text-${textIndex}`}
                    data-word-index={globalIndex}
                    className={`${colorClass} px-1 sm:px-2 py-0.5 sm:py-1 mx-0.5 rounded-md transition-all duration-200 cursor-pointer touch-manipulation select-none inline-flex items-center justify-center`}
                    style={{ 
                      wordBreak: 'keep-all', 
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onClick={(e) => handleWordClick(word, e)}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleWordClick(word, e);
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Floating Audio Icon */}
          {showAudioIcon && selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.1, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                scale: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="fixed z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-2 sm:p-3 shadow-2xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all border-2 border-white"
              style={{
                left: `${Math.max(20, Math.min(window.innerWidth - 60, iconPosition.x - 20))}px`,
                top: `${Math.max(80, iconPosition.y)}px`,
                transform: 'translateX(-50%)',
                WebkitTapHighlightColor: 'transparent'
              }}
              onClick={(e) => playSelectedText(e)}
              onTouchEnd={(e) => {
                e.preventDefault();
                playSelectedText(e);
              }}
            >
              <Volume2 size={18} className="sm:w-5 sm:h-5 drop-shadow-sm" />
            </motion.div>
          )}

          {/* Legenda das Cores */}
          {(isReadingMode || isAutoReading) && (
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-100 rounded-lg border border-gray-200 dark:border-gray-300">
              <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-800 mb-2 sm:mb-3">Legenda de Cores:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                {isAutoReading && (
                  <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded shadow-lg animate-pulse"></span>
                    <span className="font-semibold text-blue-700">Palavra Atual</span>
                  </div>
                )}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 dark:bg-green-300 rounded border border-green-300"></span>
                  <span className="text-green-700">Correta</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-200 dark:bg-yellow-300 rounded border border-yellow-300"></span>
                  <span className="text-yellow-700">Próxima</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-200 dark:bg-red-300 rounded border border-red-300"></span>
                  <span className="text-red-700">Melhorar</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-300 rounded border border-gray-300"></span>
                  <span className="text-gray-700">Não Lida</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status do Microfone */}
      {isListening && (
        <Card className="border-2 border-cartoon-coral">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-cartoon-coral">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex items-center justify-center"
              >
                <Mic size={20} className="sm:w-6 sm:h-6" />
              </motion.div>
              <div className="text-center sm:text-left">
                <span className="font-medium text-sm sm:text-base block">Ouvindo... Leia o texto!</span>
                <span className="text-xs sm:text-sm text-cartoon-coral/80 hidden sm:block">Pronuncie as palavras claramente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript e Progresso */}
      {transcript && (
        <Card className="border-2 border-blue-200 dark:border-blue-300">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-700 font-medium">O que você disse:</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-700 font-semibold">
                    Progresso: {Math.round(readingProgress)}%
                  </span>
                  <Progress value={readingProgress} className="w-20 sm:w-24 h-2" />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-100 p-3 rounded-lg border border-blue-200 dark:border-blue-300">
                <p className="text-gray-800 dark:text-gray-900 text-sm sm:text-base break-words">{transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso de Compatibilidade */}
      {!isSupported && (
        <Card className="border-2 border-yellow-200 dark:border-yellow-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div>
                <p className="text-yellow-800 dark:text-yellow-900 text-sm sm:text-base font-medium mb-1">
                  Reconhecimento de voz não disponível
                </p>
                <p className="text-yellow-700 dark:text-yellow-800 text-xs sm:text-sm">
                  Use Chrome, Edge ou Safari para ativar o reconhecimento de voz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
