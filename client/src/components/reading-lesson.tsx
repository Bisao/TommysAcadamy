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

  // Auto-reading functionality with word tracking using speech events
  const startAutoReading = () => {
    setIsAutoReading(true);
    setIsPaused(false);
    setCurrentWordIndex(-1); // Start with -1 to highlight title first

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const fullContent = `${title}. ${text}`;

    // Create word boundary callback for synchronization
    const handleWordBoundary = (word: string, index: number) => {
      // Adjust index to account for title words
      const totalTitleWords = titleWords.length;

      if (index <= totalTitleWords) {
        // Still reading title or just finished
        setCurrentWordIndex(-1);
      } else {
        // Reading main text - adjust index by removing title words and the pause
        const textWordIndex = index - totalTitleWords - 1;
        if (textWordIndex >= 0 && textWordIndex < words.length) {
          setCurrentWordIndex(textWordIndex);

          // Scroll to current word
          setTimeout(() => {
            const wordElement = document.querySelector(`[data-word-index="${textWordIndex}"]`);
            if (wordElement) {
              const elementRect = wordElement.getBoundingClientRect();
              const headerHeight = 80;
              const audioBarHeight = 120;
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

    // Start reading with word boundary synchronization
    playText(fullContent, "en-US", 0, handleWordBoundary);

    toast({
      title: "🎯 Professor Tommy lendo o texto",
      description: "Acompanhe as palavras destacadas em tempo real",
    });
  };

  const pauseAutoReading = () => {
    setIsPaused(true);
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
    if (isAudioPaused) {
      resumeAudio();
    }
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
    const textWords = text.split(/\s+/).filter(word => word.length > 0);

    setWordFeedback(prevFeedback => {
      const newFeedback = [...prevFeedback];

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

      return newFeedback;
    });
  }, [text]);

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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    // Handle tab visibility changes to maintain sync
    const handleVisibilityChange = () => {
      if (document.hidden && isAutoReading && !isPaused) {
        pauseAutoReading();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAutoReading, isPaused]);

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
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pt-20">
      {/* Controles de Áudio e Leitura - Acima do Painel de Texto */}
      <Card className="border-2 border-cartoon-gray bg-white shadow-lg">
        <CardContent className="p-3 sm:p-4">
          {/* Botões lado a lado */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
            {/* Leitura Guiada */}
            <div className="flex items-center gap-2">
              {!isAutoReading ? (
                <Button
                  onClick={startAutoReading}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  title="Iniciar leitura guiada"
                >
                  <Play size={16} className="sm:w-5 sm:h-5" />
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button
                      onClick={resumeAutoReading}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      title="Continuar leitura guiada"
                    >
                      <Play size={16} className="sm:w-5 sm:h-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseAutoReading}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      title="Pausar leitura guiada"
                    >
                      <Pause size={16} className="sm:w-5 sm:h-5" />
                    </Button>
                  )}
                  <Button
                    onClick={stopAutoReading}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    title="Parar leitura guiada"
                  >
                    <VolumeX size={16} className="sm:w-5 sm:h-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Reconhecimento de Voz */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-700 hidden sm:block">🎤 Sua Leitura:</span>
              <Button
                onClick={toggleReadingMode}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${
                  isReadingMode 
                    ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                    : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                title={isReadingMode ? "Parar reconhecimento" : "Iniciar reconhecimento de voz"}
              >
                {isReadingMode ? <MicOff size={16} className="sm:w-5 sm:h-5" /> : <Mic size={16} className="sm:w-5 sm:h-5" />}
              </Button>

              {/* Reset Button */}
              <Button
                onClick={resetReading}
                disabled={!transcript}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                title="Reiniciar leitura"
              >
                <RotateCcw size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de Texto */}
      <Card className="border-2 border-cartoon-gray">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="text-center">
            <CardTitle 
              className={`text-xl sm:text-2xl text-cartoon-dark transition-all duration-300 ${
                isAutoReading && currentWordIndex === -1 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-xl scale-105 transform' 
                  : ''
              }`}
            >
              {title}
            </CardTitle>
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