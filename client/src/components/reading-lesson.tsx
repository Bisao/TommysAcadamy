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
  const textRef = useRef<HTMLDivElement>(null);

  const { playText, stopAudio, isPlaying } = useAudio();
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

  const playSelectedText = () => {
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
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Área de Texto - Prioridade no topo */}
      <Card className="border-2 border-cartoon-gray shadow-lg">
        <CardContent className="relative p-6">
          <div
            ref={textRef}
            className="text-lg leading-relaxed p-4 bg-white rounded-lg border border-gray-200 cursor-text select-text break-words whitespace-pre-wrap overflow-wrap-anywhere"
            onMouseUp={handleTextSelection}
            style={{ userSelect: 'text', wordBreak: 'break-word', overflowWrap: 'break-word' }}
          >
            {text.split(/\s+/).map((word, index) => {
              const feedback = wordFeedback[index];
              let colorClass = '';

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

              return (
                <span
                  key={index}
                  className={`${colorClass} px-1 py-0.5 rounded transition-colors duration-300 mr-1 inline-block cursor-pointer hover:bg-blue-100`}
                  style={{ wordBreak: 'break-word' }}
                  onClick={(e) => handleWordClick(word, e)}
                >
                  {word}
                </span>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (selectedText) {
                  playText(selectedText);
                  setShowAudioIcon(false);
                  setSelectedText("");
                }
              }}
            >
              <Volume2 size={24} className="drop-shadow-sm" />
            </motion.div>
          )}

          {/* Legenda das Cores */}
          {isReadingMode && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Legenda de Cores:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-200 rounded border"></span>
                  <span>Pronuncia Correta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-200 rounded border"></span>
                  <span>Pronuncia Próxima</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-200 rounded border"></span>
                  <span>Precisa Melhorar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-200 rounded border"></span>
                  <span>Não Lida</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Áudio e Leitura */}
      <Card className="border-2 border-cartoon-gray shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={isPlaying ? stopAudio : playFullText}
              className="cartoon-button bg-cartoon-blue hover:bg-cartoon-blue/80 flex items-center gap-2"
              size="lg"
            >
              {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
              <span className="hidden sm:inline">
                {isPlaying ? "Parar Áudio" : "Ouvir Texto"}
              </span>
            </Button>

            <Button
              onClick={toggleReadingMode}
              className={`cartoon-button flex items-center gap-2 ${
                isReadingMode 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-cartoon-coral hover:bg-cartoon-coral/80"
              }`}
              size="lg"
            >
              {isReadingMode ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="hidden sm:inline">
                {isReadingMode ? "Parar" : "Começar a Ler"}
              </span>
            </Button>

            <Button
              onClick={resetReading}
              variant="outline"
              disabled={!transcript}
              className="border-cartoon-coral text-cartoon-coral hover:bg-cartoon-coral hover:text-white flex items-center gap-2"
              size="lg"
            >
              <RotateCcw size={20} />
              <span className="hidden sm:inline">Recomeçar</span>
            </Button>

            <Button
              onClick={() => {
                if (selectedText) {
                  playText(selectedText);
                  setShowAudioIcon(false);
                  setSelectedText("");
                }
              }}
              disabled={!selectedText || isPlaying}
              variant="outline"
              className="border-cartoon-teal text-cartoon-teal hover:bg-cartoon-teal hover:text-white flex items-center gap-2"
              size="lg"
            >
              <Play size={20} />
              <span className="hidden sm:inline">Ouvir Seleção</span>
            </Button>
          </div>

          {/* Progresso da Leitura */}
          {isReadingMode && (
            <div className="space-y-3 mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-medium">Progresso da Leitura</span>
                <span className="font-bold text-cartoon-coral text-lg">
                  {Math.round(readingProgress)}%
                </span>
              </div>
              <Progress value={readingProgress} className="h-4" />

              {readingProgress >= 80 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  <CheckCircle size={20} />
                  Excelente! Continue assim!
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status do Microfone */}
      {isListening && (
        <Card className="border-2 border-cartoon-coral shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3 text-cartoon-coral">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Mic size={24} />
              </motion.div>
              <span className="font-medium text-lg">Ouvindo... Leia o texto!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {transcript && (
        <Card className="border-2 border-blue-200 shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-3 font-medium">O que você disse:</p>
            <p className="text-gray-800 bg-blue-50 p-4 rounded-lg border border-blue-200">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {!isSupported && (
        <Card className="border-2 border-yellow-200 shadow-md">
          <CardContent className="p-6">
            <p className="text-yellow-800 text-sm bg-yellow-50 p-4 rounded-lg">
              Reconhecimento de voz não está disponível neste navegador. 
              Recomendamos usar Chrome ou Edge para melhor experiência.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}