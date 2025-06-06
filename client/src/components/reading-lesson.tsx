
import { useState, useRef, useCallback } from "react";
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

export default function ReadingLesson({ title, text, onComplete }: ReadingLessonProps) {
  const [selectedText, setSelectedText] = useState("");
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
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

  // Simular progresso de leitura baseado no texto falado
  const calculateReadingProgress = useCallback((spokenText: string) => {
    const wordsInText = text.split(/\s+/).length;
    const wordsSpoken = spokenText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.min((wordsSpoken / wordsInText) * 100, 100);
  }, [text]);

  // Atualizar progresso quando o transcript muda
  useState(() => {
    if (transcript) {
      const progress = calculateReadingProgress(transcript);
      setReadingProgress(progress);
    }
  });

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const playSelectedText = () => {
    if (selectedText) {
      playText(selectedText);
      toast({
        title: "🔊 Reproduzindo seleção",
        description: "Ouvindo o texto selecionado...",
      });
    }
  };

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
    toast({
      title: "🔄 Leitura reiniciada",
      description: "Comece novamente a leitura do texto.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com Tommy */}
      <Card className="border-4 border-cartoon-teal bg-gradient-to-r from-cartoon-mint/20 to-cartoon-teal/20">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-cartoon-teal">
              <AvatarImage src="/teacher-tommy.png" alt="Teacher Tommy" />
              <AvatarFallback className="bg-cartoon-yellow text-cartoon-dark text-xl font-bold">
                🧑‍🏫
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl text-cartoon-dark">{title}</CardTitle>
              <p className="text-gray-600">Lição de Leitura com Professor Tommy</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles de Áudio */}
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
              onClick={stopAudio}
              disabled={!isPlaying}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Pause size={20} />
              Parar
            </Button>
          </div>

          {selectedText && (
            <div className="mt-4 p-3 bg-cartoon-mint/20 rounded-lg border border-cartoon-teal">
              <p className="text-sm text-gray-600 mb-1">Texto selecionado:</p>
              <p className="font-medium text-cartoon-dark">"{selectedText}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de Texto */}
      <Card className="border-2 border-cartoon-gray">
        <CardHeader>
          <CardTitle className="text-xl text-cartoon-dark">Texto da Lição</CardTitle>
          <p className="text-sm text-gray-600">
            Selecione palavras ou frases para ouvir a pronúncia do Professor Tommy
          </p>
        </CardHeader>
        <CardContent>
          <div
            ref={textRef}
            className="text-lg leading-relaxed p-4 bg-white rounded-lg border border-gray-200 cursor-text select-text"
            onMouseUp={handleTextSelection}
            style={{ userSelect: 'text' }}
          >
            {text}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Leitura do Aluno */}
      <Card className="border-2 border-cartoon-coral">
        <CardHeader>
          <CardTitle className="text-xl text-cartoon-dark flex items-center gap-2">
            <Mic className="text-cartoon-coral" size={24} />
            Sua Vez de Ler
          </CardTitle>
          <p className="text-sm text-gray-600">
            Leia o texto em voz alta para praticar sua pronúncia
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
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
          </div>

          {/* Progresso da Leitura */}
          {isReadingMode && (
            <div className="space-y-2">
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
                  Excelente leitura! Continue assim!
                </motion.div>
              )}
            </div>
          )}

          {/* Status do Microfone */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 text-cartoon-coral">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Mic size={20} />
              </motion.div>
              <span className="font-medium">Ouvindo... Leia o texto!</span>
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">O que você disse:</p>
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}

          {!isSupported && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                ⚠️ Reconhecimento de voz não está disponível neste navegador. 
                Recomendamos usar Chrome ou Edge para melhor experiência.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
