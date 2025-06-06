
import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  confidence: number;
  interimTranscript: string;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestartingRef = useRef(false);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Detectar dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth < 768 || 
                   'ontouchstart' in window ||
                   navigator.maxTouchPoints > 0;

  const cleanup = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    isRestartingRef.current = false;
  }, []);

  const stopListening = useCallback(() => {
    console.log("Stopping speech recognition");
    cleanup();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("Error stopping recognition:", error);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, [cleanup]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.warn("Speech recognition not supported");
      return;
    }

    if (isListening && recognitionRef.current) {
      console.log("Already listening, not starting again");
      return;
    }

    console.log("Starting speech recognition - Mobile:", isMobile);
    cleanup();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configurações otimizadas para mobile e desktop
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    // Configurações específicas para mobile
    if (isMobile) {
      // No mobile, usar configurações mais conservadoras
      recognition.continuous = false; // Evitar problemas de timeout
      recognition.interimResults = false; // Reduzir overhead no mobile
    }

    let finalTranscriptAccumulator = transcript;
    let lastActivityTime = Date.now();
    let noSpeechCount = 0;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      setInterimTranscript("");
      lastActivityTime = Date.now();
      noSpeechCount = 0;
      isRestartingRef.current = false;
    };

    recognition.onresult = (event) => {
      let interimTranscriptResult = '';
      let finalTranscriptResult = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const resultTranscript = result[0].transcript;
        const resultConfidence = result[0].confidence || 0;

        if (result.isFinal) {
          finalTranscriptResult += resultTranscript;
          maxConfidence = Math.max(maxConfidence, resultConfidence);
          console.log("Final result:", resultTranscript, "Confidence:", resultConfidence);
        } else {
          interimTranscriptResult += resultTranscript;
        }
      }

      if (finalTranscriptResult) {
        finalTranscriptAccumulator += finalTranscriptResult;
        setTranscript(finalTranscriptAccumulator);
        setConfidence(maxConfidence);
        lastActivityTime = Date.now();
        
        // No mobile, reiniciar automaticamente após receber resultado final
        if (isMobile && !isRestartingRef.current) {
          console.log("Mobile: Restarting recognition after final result");
          isRestartingRef.current = true;
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              startListening();
            }
          }, 300);
        }
      }

      setInterimTranscript(interimTranscriptResult);
      
      // Atualizar tempo de última atividade se houve qualquer resultado
      if (finalTranscriptResult || interimTranscriptResult) {
        lastActivityTime = Date.now();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event);
      
      // Diferentes estratégias baseadas no tipo de erro
      switch (event.error) {
        case 'network':
          console.log("Network error - will retry in 2 seconds");
          setIsListening(false);
          if (!isRestartingRef.current) {
            isRestartingRef.current = true;
            restartTimeoutRef.current = setTimeout(() => {
              if (isListening) startListening();
            }, 2000);
          }
          break;
          
        case 'aborted':
          console.log("Recognition aborted - this is expected during stop");
          setIsListening(false);
          break;
          
        case 'no-speech':
          noSpeechCount++;
          console.log(`No speech detected (${noSpeechCount} times)`);
          
          // Se não detectou fala por muito tempo, reiniciar
          if (noSpeechCount >= 3) {
            console.log("Too many no-speech events, restarting");
            if (!isRestartingRef.current) {
              isRestartingRef.current = true;
              restartTimeoutRef.current = setTimeout(() => {
                if (isListening) startListening();
              }, 1000);
            }
          }
          break;
          
        case 'audio-capture':
          console.log("Audio capture error - microphone may be in use");
          setIsListening(false);
          break;
          
        case 'not-allowed':
          console.log("Microphone access denied");
          setIsListening(false);
          break;
          
        default:
          console.log("Other error, attempting restart");
          setIsListening(false);
          if (!isRestartingRef.current) {
            isRestartingRef.current = true;
            restartTimeoutRef.current = setTimeout(() => {
              if (isListening) startListening();
            }, 1500);
          }
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      
      // Se parou mas ainda deveria estar ouvindo, reiniciar
      if (isListening && !isRestartingRef.current) {
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        console.log(`Recognition ended unexpectedly. Time since last activity: ${timeSinceLastActivity}ms`);
        
        // Reiniciar automaticamente se parou inesperadamente
        if (timeSinceLastActivity < 30000) { // Se houve atividade nos últimos 30 segundos
          console.log("Auto-restarting recognition");
          isRestartingRef.current = true;
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              startListening();
            }
          }, 500);
        } else {
          console.log("No recent activity, stopping recognition");
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
      
      setInterimTranscript("");
    };

    // Iniciar o reconhecimento
    try {
      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
    }
  }, [isSupported, isListening, transcript, isMobile, cleanup]);

  const resetTranscript = useCallback(() => {
    console.log("Resetting transcript");
    setTranscript("");
    setInterimTranscript("");
    setConfidence(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn("Error stopping recognition on cleanup:", error);
        }
      }
    };
  }, [cleanup]);

  return {
    isListening,
    transcript,
    interimTranscript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  };
}
