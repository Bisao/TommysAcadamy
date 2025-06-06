
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw,
} from "lucide-react";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from "@/hooks/use-toast";

interface WordFeedback {
  word: string;
  status: 'correct' | 'close' | 'incorrect' | 'unread';
}

export function useReadingControls(title: string, text: string) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordFeedback, setWordFeedback] = useState<WordFeedback[]>([]);
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

  const resumeAutoReading = useCallback(() => {
    if (!isAutoReading) return;
    setIsPaused(false);
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const remainingWords = words.slice(currentWordIndex + 1);
    const remainingText = remainingWords.join(' ');
    
    if (remainingText.trim()) {
      const handleWordBoundary = (word: string, index: number) => {
        const adjustedIndex = currentWordIndex + 1 + index;
        if (adjustedIndex >= 0 && adjustedIndex < words.length) {
          setCurrentWordIndex(adjustedIndex);

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

      playText(remainingText, "en-US", 0, handleWordBoundary);
    }
    
    toast({
      title: "🎯 Professor Tommy retomando",
      description: "Continuando de onde parou",
    });
  }, [isAutoReading, currentWordIndex, text, playText, toast]);

  const stopAutoReading = useCallback(() => {
    setIsAutoReading(false);
    setIsPaused(false);
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
  }, [text, resetTranscript, toast]);

  const createAudioControls = useCallback(() => (
    <div className="flex items-center gap-2">
      {!isAutoReading ? (
        <Button
          onClick={startAutoReading}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Iniciar leitura guiada"
        >
          <Play size={16} />
        </Button>
      ) : (
        <>
          {isPaused ? (
            <Button
              onClick={resumeAutoReading}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              title="Continuar leitura guiada"
            >
              <Play size={16} />
            </Button>
          ) : (
            <Button
              onClick={pauseAutoReading}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              title="Pausar leitura guiada"
            >
              <Pause size={16} />
            </Button>
          )}
          <Button
            onClick={stopAutoReading}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            title="Parar leitura guiada"
          >
            <VolumeX size={16} />
          </Button>
        </>
      )}

      <Button
        onClick={toggleReadingMode}
        className={`w-10 h-10 rounded-full ${
          isReadingMode 
            ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
            : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
        title={isReadingMode ? "Parar reconhecimento" : "Iniciar reconhecimento de voz"}
      >
        {isReadingMode ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>

      <Button
        onClick={resetReading}
        disabled={!transcript}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        title="Reiniciar leitura"
      >
        <RotateCcw size={16} />
      </Button>
    </div>
  ), [isAutoReading, isPaused, isReadingMode, transcript, startAutoReading, resumeAutoReading, pauseAutoReading, stopAutoReading, toggleReadingMode, resetReading]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoReadingTimerRef.current) {
        clearTimeout(autoReadingTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    isReadingMode,
    readingProgress,
    wordFeedback,
    isAutoReading,
    currentWordIndex,
    isPaused,
    isListening,
    transcript,
    isSupported,
    
    // Functions
    startAutoReading,
    pauseAutoReading,
    resumeAutoReading,
    stopAutoReading,
    toggleReadingMode,
    resetReading,
    createAudioControls,
    setWordFeedback,
    setReadingProgress,
  };
}
