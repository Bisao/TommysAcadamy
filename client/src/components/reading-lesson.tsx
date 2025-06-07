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
  const [isPaused, setIsPaused] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const autoReadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { playText, pauseAudio, resumeAudio, stopAudio, isPlaying, isPaused: isAudioPaused, currentUtterance } = useAudio();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported,
    confidence,
    interimTranscript
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
    // Verificar se já está lendo para evitar múltiplas instâncias
    if (isAutoReading) {
      console.log("Already in auto reading mode, skipping");
      return;
    }

    setIsAutoReading(true);
    setIsPaused(false);
    setCurrentWordIndex(-1); // Iniciar sem destaque

    const titleWords = title.split(/\s+/).filter(word => word.length > 0);
    const textWords = text.split(/\s+/).filter(word => word.length > 0);
    const fullContent = `${title}. ${text}`;

    // Validar se há conteúdo para ler
    if (!fullContent.trim()) {
      console.error("No content to read");
      setIsAutoReading(false);
      return;
    }

    // Função para scroll automático
    const scrollToWord = (wordIndex: number, isTitle: boolean) => {
      requestAnimationFrame(() => {
        const selector = isTitle ? `[data-word-index="title-${wordIndex}"]` : `[data-word-index="text-${wordIndex}"]`;
        const wordElement = document.querySelector(selector);

        if (wordElement) {
          const elementRect = wordElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 640;
          const headerHeight = isMobile ? 60 : 80;
          const audioBarHeight = isMobile ? 100 : 120;
          const totalOffset = headerHeight + audioBarHeight + 20;
          const targetY = window.scrollY + elementRect.top - totalOffset;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      });
    };

    // Função sincronizada para word boundaries - VOZ E HIGHLIGHT JUNTOS
    const handleWordBoundary = (word: string, wordIndex: number) => {
      console.log(`Word boundary triggered: "${word}" at index ${wordIndex}`);
      
      const totalTitleWords = titleWords.length;

      // Sincronizar highlight EXATAMENTE quando a palavra é falada
      if (wordIndex < totalTitleWords) {
        // Está no título
        setCurrentWordIndex(wordIndex);
        scrollToWord(wordIndex, true);
        console.log(`Highlighting title word ${wordIndex}: "${word}"`);
      } else {
        // Está no texto principal (compensar pelo ponto após título)
        const textWordIndex = wordIndex - totalTitleWords - 1;
        if (textWordIndex >= 0 && textWordIndex < textWords.length) {
          const globalIndex = totalTitleWords + textWordIndex;
          setCurrentWordIndex(globalIndex);
          scrollToWord(textWordIndex, false);
          console.log(`Highlighting text word ${globalIndex}: "${word}"`);

          // Auto-finalizar quando chegar na última palavra
          if (textWordIndex >= textWords.length - 1) {
            console.log("Last word reached, finishing reading");
            setTimeout(() => {
              setIsAutoReading(false);
              setIsPaused(false);
              setCurrentWordIndex(-1);
              toast({
                title: "🎉 Leitura concluída!",
                description: "Professor Tommy terminou de ler o texto.",
              });
            }, 1000);
          }
        }
      }
    };

    console.log("Starting auto reading with word boundary sync");
    
    try {
      // Iniciar áudio E highlight JUNTOS
      playText(fullContent, "en-US", 0, handleWordBoundary);
      
      // Destacar primeira palavra imediatamente quando o áudio começar
      setTimeout(() => {
        setCurrentWordIndex(0);
        scrollToWord(0, true);
        console.log("First word highlighted at start");
      }, 100);
      
      toast({
        title: "🎯 Professor Tommy lendo o texto",
        description: "Voz e destaque sincronizados",
      });
    } catch (error) {
      console.error("Error starting auto reading:", error);
      setIsAutoReading(false);
      setCurrentWordIndex(-1);
      toast({
        title: "❌ Erro na leitura",
        description: "Não foi possível iniciar a leitura automática.",
        variant: "destructive"
      });
    }
  }, [title, text, playText, toast, isAutoReading]);

  const pauseAutoReading = useCallback(() => {
    console.log("Pausing auto reading - maintaining word sync");
    
    // Pausar imediatamente tanto o áudio quanto manter o highlight
    setIsPaused(true);
    if (isPlaying) {
      pauseAudio();
    }
    
    // Manter o highlight na palavra atual durante a pausa
    console.log(`Paused at word index: ${currentWordIndex}`);
    
    toast({
      title: "⏸️ Professor Tommy pausado",
      description: "Voz e destaque pausados na mesma palavra",
    });
  }, [isPlaying, pauseAudio, currentWordIndex, toast]);

  const resumeAutoReading = useCallback(() => {
    if (!isAutoReading) return;

    console.log("Resuming auto reading from word:", currentWordIndex);

    // Verificar se speechSynthesis está disponível
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available for resume");
      return;
    }

    // Tentar retomar áudio pausado MANTENDO sincronização
    if (isPaused && speechSynthesis.paused && speechSynthesis.speaking && currentUtterance) {
      try {
        resumeAudio();
        setIsPaused(false);
        console.log("Successfully resumed paused speech");
        
        toast({
          title: "▶️ Professor Tommy retomando",
          description: "Voz e destaque continuando juntos",
        });
        return;
      } catch (error) {
        console.warn("Erro ao retomar áudio pausado:", error);
      }
    }

    // Se não conseguiu retomar, reiniciar do início MANTENDO sincronização
    console.log("Restarting from beginning due to resume failure");
    setIsPaused(false);
    stopAudio();
    
    // Pequeno delay para garantir que o áudio parou completamente
    setTimeout(() => {
      startAutoReading();
    }, 200);
    
    toast({
      title: "🔄 Reiniciando leitura",
      description: "Voz e destaque sincronizados desde o início",
    });
  }, [isAutoReading, isPaused, currentUtterance, resumeAudio, toast, stopAudio, startAutoReading]);

  const stopAutoReading = useCallback(() => {
    console.log("Stopping auto reading - full reset");
    
    // Parar tudo imediatamente e sincronizadamente
    setIsAutoReading(false);
    setIsPaused(false);
    setCurrentWordIndex(-1); // Reset para não destacar nenhuma palavra

    // Limpar qualquer timer pendente
    if (autoReadingTimerRef.current) {
      clearTimeout(autoReadingTimerRef.current);
    }

    // Verificar se speechSynthesis está disponível antes de parar áudio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Parar áudio se estiver tocando ou pausado
      if (isPlaying || isAudioPaused) {
        stopAudio();
      }
    }

    console.log("Auto reading stopped - voz e highlight resetados");

    toast({
      title: "⏹️ Professor Tommy parado",
      description: "Leitura automática interrompida",
    });
  }, [isPlaying, isAudioPaused, stopAudio, toast]);

  const toggleReadingMode = useCallback(() => {
    if (isReadingMode) {
      stopListening();
      setIsReadingMode(false);

      const finalProgress = Math.round(readingProgress);
      if (finalProgress >= 80) {
        toast({
          title: "🎉 Parabéns!",
          description: `Você leu ${finalProgress}% do texto com sucesso!`,
        });
      } else {
        toast({
          title: "📖 Leitura finalizada",
          description: `Você leu ${finalProgress}% do texto. Continue praticando!`,
        });
      }
    } else {
      if (isSupported) {
        // Verificar permissões de microfone antes de iniciar
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              setIsReadingMode(true);
              resetTranscript();
              setReadingProgress(0);
              startListening();
              toast({
                title: "🎤 Modo de leitura ativado",
                description: "Comece a ler o texto em voz alta...",
              });
            })
            .catch((error) => {
              console.error("Microphone permission denied:", error);
              toast({
                title: "🎤 Acesso ao microfone negado",
                description: "Permita o acesso ao microfone para usar o reconhecimento de voz.",
                variant: "destructive"
              });
            });
        } else {
          // Fallback para browsers sem getUserMedia
          setIsReadingMode(true);
          resetTranscript();
          setReadingProgress(0);
          startListening();
          toast({
            title: "🎤 Modo de leitura ativado",
            description: "Comece a ler o texto em voz alta...",
          });
        }
      } else {
        toast({
          title: "❌ Recurso não disponível",
          description: "Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.",
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

  // Cleanup when component unmounts or user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("Page unloading - stopping all reading activities");
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (isAutoReading || isPlaying) {
          stopAudio();
        }
      }
      if (isListening) {
        stopListening();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden - pausing reading activities");
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (isAutoReading && isPlaying) {
            pauseAutoReading();
          }
        }
      }
    };

    // Stop reading when user navigates away
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log("ReadingLesson component unmounting - cleaning up all activities");
      
      // Stop all reading activities
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (isAutoReading || isPlaying) {
          stopAudio();
        }
      }
      if (isListening) {
        stopListening();
      }
      
      // Clear timers
      if (autoReadingTimerRef.current) {
        clearTimeout(autoReadingTimerRef.current);
      }

      // Remove event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isAutoReading, isPlaying, isListening, stopAudio, stopListening, pauseAutoReading]);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
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
              <h2 className="text-xl sm:text-2xl font-bold text-cartoon-dark mb-3 leading-normal">
                {title.split(/\s+/).map((word, index) => {
                  const titleWordsCount = title.split(/\s+/).length;
                  // Highlight durante leitura automática: verificar se é a palavra atual e se não está parado
                  const isCurrentWord = isAutoReading && currentWordIndex === index && currentWordIndex >= 0;
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
                      data-word-index={`title-${index}`}
                      className={`${colorClass} px-1 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all duration-200 mr-1 sm:mr-2 inline-block cursor-pointer touch-manipulation select-none`}
                      style={{ 
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
              </h2>
            </div>

            {/* Texto principal */}
            <div className="text-justify leading-relaxed">
              {text.split(/\s+/).map((word, textIndex) => {
                const titleWordsCount = title.split(/\s+/).length;
                const globalIndex = titleWordsCount + textIndex;
                const feedback = wordFeedback[globalIndex];
                // Highlight durante leitura automática: verificar se é a palavra atual e se não está parado
                const isCurrentWord = isAutoReading && currentWordIndex === globalIndex && currentWordIndex >= 0;
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
                    data-word-index={`text-${textIndex}`}
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
      {(transcript || interimTranscript) && (
        <Card className="border-2 border-blue-200 dark:border-blue-300">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-700 font-medium">O que você disse:</p>
                  {confidence > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(confidence * 100)}% confiança
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-700 font-semibold">
                    Progresso: {Math.round(readingProgress)}%
                  </span>
                  <Progress value={readingProgress} className="w-20 sm:w-24 h-2" />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-100 p-3 rounded-lg border border-blue-200 dark:border-blue-300">
                <p className="text-gray-800 dark:text-gray-900 text-sm sm:text-base break-words">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-500 italic ml-1">
                      {interimTranscript}
                    </span>
                  )}
                </p>
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