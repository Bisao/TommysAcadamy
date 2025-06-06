
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
    playText(text);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      

      {/* Controles de Áudio e Leitura */}
      <Card className="border-2 border-cartoon-gray">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={playFullText}
              disabled={isPlaying}
              className="cartoon-button bg-cartoon-blue hover:bg-cartoon-blue/80"
            >
              {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
              {isPlaying ? "Parando..." : "Ouvir Texto Completo"}
            </Button>

            <Button
              onClick={playSelectedText}
              disabled={!selectedText || isPlaying}
              variant="outline"
              className="border-cartoon-teal text-cartoon-teal hover:bg-cartoon-teal hover:text-white"
            >
              <Play size={20} />
              Ouvir Seleção
            </Button>

            <Button
              onClick={toggleReadingMode}
              className={`cartoon-button ${
                isReadingMode 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-cartoon-coral hover:bg-cartoon-coral/80"
              }`}
            >
              {isReadingMode ? <MicOff size={20} /> : <Mic size={20} />}
              {isReadingMode ? "Parar Gravação" : "Começar a Ler"}
            </Button>

            <Button
              onClick={resetReading}
              variant="outline"
              disabled={!transcript}
              className="border-cartoon-coral text-cartoon-coral hover:bg-cartoon-coral hover:text-white"
            >
              <RotateCcw size={20} />
              Recomeçar
            </Button>

            <Button
              onClick={stopAudio}
              disabled={!isPlaying}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Pause size={20} />
              Parar
            </Button>
          </div>

          {/* Progresso da Leitura */}
          {isReadingMode && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso da Leitura</span>
                <span className="font-semibold text-cartoon-coral">
                  {Math.round(readingProgress)}%
                </span>
              </div>
              <Progress value={readingProgress} className="h-3" />
              
              {readingProgress >= 80 && (
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
        <CardHeader>
          <div className="text-center mb-4">
            <CardTitle className="text-2xl text-cartoon-dark mb-2">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
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
                  className={`${colorClass} px-1 py-0.5 rounded transition-colors duration-300 mr-1 inline-block`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Floating Audio Icon */}
          {showAudioIcon && selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed z-50 bg-cartoon-blue text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-cartoon-blue/80 transition-colors"
              style={{
                left: `${iconPosition.x - 20}px`,
                top: `${iconPosition.y}px`,
                transform: 'translateX(-50%)'
              }}
              onClick={playSelectedText}
            >
              🔈
            </motion.div>
          )}
          
          {/* Legenda das Cores */}
          {isReadingMode && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Legenda de Cores:</p>
              <div className="flex flex-wrap gap-4 text-sm">
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
        <Card className="border-2 border-cartoon-coral">
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
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">O que você disse:</p>
            <p className="text-gray-800">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {!isSupported && (
        <Card className="border-2 border-yellow-200">
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
