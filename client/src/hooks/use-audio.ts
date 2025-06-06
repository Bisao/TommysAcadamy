import { useState, useCallback } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [remainingText, setRemainingText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const playText = useCallback(async (text: string, lang: string = "pt-BR", fromPosition: number = 0, onWordBoundary?: (word: string, index: number) => void) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    console.log("playText called - current state:", {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      isPlaying,
      isPaused
    });

    // Stop any currently playing speech and wait for it to complete
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      
      // Aguardar até que o speechSynthesis pare completamente
      let attempts = 0;
      const maxAttempts = 20; // máximo 2 segundos
      while (speechSynthesis.speaking && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        console.log(`Waiting for speech to stop... attempt ${attempts}`);
      }
      
      // Aguardar um pouco mais para garantir que está totalmente limpo
      await new Promise(resolve => setTimeout(resolve, 150));
      
      console.log("After cancel - speechSynthesis state:", {
        speaking: speechSynthesis.speaking,
        paused: speechSynthesis.paused,
        attempts
      });
    }

    // Split text into words to track position
    const words = text.split(' ');
    const textToPlay = words.slice(fromPosition).join(' ');
    
    setCurrentText(text);
    setRemainingText(textToPlay);

    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 0.9; // Slightly lower pitch for male voice
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);

    // Try to select a Brazilian Portuguese voice
    const voices = speechSynthesis.getVoices();
    
    // First try to find a Brazilian Portuguese voice
    const brazilianVoice = voices.find(voice => 
      voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
    );

    // Fallback to any Portuguese voice
    const portugueseVoice = voices.find(voice => 
      voice.lang.includes('pt')
    );

    // Always prioritize American English male voice for Professor Tommy
    const americanMaleVoice = voices.find(voice => 
      voice.lang.includes('en-US') && 
      (voice.name.toLowerCase().includes('male') || 
       voice.name.toLowerCase().includes('david') ||
       voice.name.toLowerCase().includes('mark') ||
       voice.name.toLowerCase().includes('alex') ||
       voice.name.toLowerCase().includes('daniel') ||
       voice.name.toLowerCase().includes('fred') ||
       voice.name.toLowerCase().includes('paul') ||
       voice.name.toLowerCase().includes('jorge'))
    );
    
    const americanVoice = voices.find(voice => voice.lang.includes('en-US'));
    
    // Professor Tommy always uses American English voice
    if (americanMaleVoice) {
      utterance.voice = americanMaleVoice;
      utterance.lang = "en-US";
    } else if (americanVoice) {
      utterance.voice = americanVoice;
      utterance.lang = "en-US";
    }
    
    // If no English voice available, fallback to Portuguese
    if (!utterance.voice) {
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      } else if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
      setCurrentText("");
      setRemainingText("");
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      
      // Se o erro for 'interrupted', isso é esperado durante pausas/retomadas
      if (event.error === 'interrupted') {
        console.log("Speech synthesis was interrupted (this is expected during pause/resume)");
        // Só limpar o estado se não estivermos pausados (ou seja, foi um cancel intencional)
        if (!isPaused) {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
        }
        return;
      } 
      // Se o erro for 'canceled', tentar reiniciar após um delay
      else if (event.error === 'canceled') {
        console.log("Speech synthesis was canceled, attempting to restart...");
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        
        // Tentar reiniciar após um delay
        setTimeout(() => {
          console.log("Restarting speech synthesis after cancel...");
          playText(textToPlay, lang, fromPosition, onWordBoundary);
        }, 300);
        return;
      } else {
        console.error("Unexpected speech synthesis error:", event.error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      }
    };

    // Sistema de sincronização de palavra melhorado para desktop e mobile
    if (onWordBoundary) {
      let wordTimer: NodeJS.Timeout | null = null;
      let currentWordIndex = 0;
      let boundaryEventsWorking = false;
      const words = textToPlay.split(' ');
      
      // Calcular duração por palavra com base na velocidade
      const baseWordDuration = 400; // ms base por palavra
      const rateFactor = 1 / (utterance.rate || 0.8);
      const averageWordDuration = Math.max(300, baseWordDuration * rateFactor);
      
      // Detectar dispositivo móvel
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       window.innerWidth < 768 || 
                       'ontouchstart' in window;
      
      console.log(`Audio sync setup - Mobile: ${isMobile}, Words: ${words.length}, Duration per word: ${averageWordDuration}ms`);
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        console.log("Speech started - triggering first word highlight");
        
        // Disparar primeira palavra imediatamente
        onWordBoundary('', 0);
        currentWordIndex = 0;
        boundaryEventsWorking = false;
        
        // Timer fallback para sincronização (essencial para mobile)
        const startWordTimer = () => {
          console.log("Starting word timer fallback");
          wordTimer = setInterval(() => {
            if (currentWordIndex < words.length && !speechSynthesis.paused) {
              const wordToHighlight = words[currentWordIndex] || '';
              console.log(`Timer highlighting word ${currentWordIndex}: "${wordToHighlight}"`);
              onWordBoundary(wordToHighlight, currentWordIndex);
              currentWordIndex++;
            } else if (currentWordIndex >= words.length) {
              console.log("Timer completed all words");
              if (wordTimer) {
                clearInterval(wordTimer);
                wordTimer = null;
              }
            }
          }, averageWordDuration);
        };
        
        // Iniciar timer imediatamente para mobile ou após pequeno delay para desktop
        if (isMobile) {
          startWordTimer();
        } else {
          // Para desktop, aguardar um pouco para ver se boundary events funcionam
          setTimeout(() => {
            if (!boundaryEventsWorking && currentWordIndex <= 1) {
              console.log("Boundary events not working, starting timer fallback");
              startWordTimer();
            }
          }, averageWordDuration * 0.5);
        }
      };
      
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          boundaryEventsWorking = true;
          console.log("Boundary event detected - clearing timer fallback");
          
          // Limpar timer fallback se boundary events estão funcionando
          if (wordTimer) {
            clearInterval(wordTimer);
            wordTimer = null;
          }
          
          // Calcular índice da palavra baseado na posição do caractere
          const charIndex = event.charIndex;
          let wordIndex = 0;
          let charCount = 0;
          
          for (let i = 0; i < words.length; i++) {
            if (charCount + words[i].length >= charIndex) {
              wordIndex = i + fromPosition;
              break;
            }
            charCount += words[i].length + 1; // +1 para espaço
          }
          
          const actualWordIndex = wordIndex - fromPosition;
          currentWordIndex = actualWordIndex + 1;
          
          console.log(`Boundary event highlighting word ${wordIndex}: "${words[actualWordIndex] || ''}"`);
          onWordBoundary(words[actualWordIndex] || '', wordIndex);
        }
      };
      
      utterance.onend = () => {
        console.log("Speech ended - cleaning up timers");
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
        if (wordTimer) {
          clearInterval(wordTimer);
          wordTimer = null;
        }
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        
        // Tratamento específico para diferentes tipos de erro
        if (event.error === 'interrupted') {
          console.log("Speech interrupted (expected during pause/resume)");
          if (!isPaused) {
            setIsPlaying(false);
            setCurrentUtterance(null);
          }
        } else if (event.error === 'canceled') {
          console.log("Speech canceled - attempting restart");
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
          setTimeout(() => {
            playText(textToPlay, lang, fromPosition, onWordBoundary);
          }, 300);
        } else {
          console.error("Unexpected speech error:", event.error);
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
        }
        
        if (wordTimer) {
          clearInterval(wordTimer);
          wordTimer = null;
        }
      };
    } else {
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
    }

    // Wait for voices to load if not available yet
    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        const updatedVoices = speechSynthesis.getVoices();
        
        const updatedBrazilianVoice = updatedVoices.find(voice => 
          voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
        );
        
        const updatedPortugueseVoice = updatedVoices.find(voice => 
          voice.lang.includes('pt')
        );
        
        // Always prioritize American English male voice for Professor Tommy
        const updatedAmericanMaleVoice = updatedVoices.find(voice => 
          voice.lang.includes('en-US') && 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('mark') ||
           voice.name.toLowerCase().includes('alex') ||
           voice.name.toLowerCase().includes('daniel') ||
           voice.name.toLowerCase().includes('fred') ||
           voice.name.toLowerCase().includes('paul') ||
           voice.name.toLowerCase().includes('jorge'))
        );
        
        const updatedAmericanVoice = updatedVoices.find(voice => voice.lang.includes('en-US'));
        
        if (updatedAmericanMaleVoice) {
          utterance.voice = updatedAmericanMaleVoice;
          utterance.lang = "en-US";
        } else if (updatedAmericanVoice) {
          utterance.voice = updatedAmericanVoice;
          utterance.lang = "en-US";
        } else {
          // Fallback to Portuguese only if no English voice available
          if (updatedBrazilianVoice) {
            utterance.voice = updatedBrazilianVoice;
          } else if (updatedPortugueseVoice) {
            utterance.voice = updatedPortugueseVoice;
          }
        }
        
        speechSynthesis.speak(utterance);
      }, { once: true });
    } else {
      speechSynthesis.speak(utterance);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    console.log("pauseAudio called - speechSynthesis.speaking:", speechSynthesis.speaking, "speechSynthesis.paused:", speechSynthesis.paused);
    
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      try {
        speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
        console.log("Speech synthesis paused successfully");
      } catch (error) {
        console.warn("Error pausing speech synthesis:", error);
        // Fallback para móveis que não suportam pause
        speechSynthesis.cancel();
        setIsPaused(true);
        setIsPlaying(false);
      }
    }
  }, []);

  const resumeAudio = useCallback(() => {
    console.log("resumeAudio called - speechSynthesis.paused:", speechSynthesis.paused, "speechSynthesis.speaking:", speechSynthesis.speaking);
    console.log("currentUtterance exists:", !!currentUtterance, "isPaused:", isPaused);
    
    // Verificar se há uma utterance pausada válida
    if (currentUtterance && isPaused) {
      try {
        // Tentar retomar se está pausado
        if (speechSynthesis.paused && speechSynthesis.speaking) {
          console.log("Resuming paused speech synthesis...");
          speechSynthesis.resume();
          setIsPaused(false);
          setIsPlaying(true);
          console.log("Speech synthesis resumed successfully");
        } 
        // Se não está pausado mas temos utterance, pode ter sido cancelado (mobile)
        else if (!speechSynthesis.speaking) {
          console.log("Speech was canceled, cannot resume with current method");
          throw new Error("Speech was canceled, needs restart");
        }
        else {
          console.log("Speech synthesis already running");
          setIsPaused(false);
          setIsPlaying(true);
        }
      } catch (error) {
        console.warn("Error resuming speech synthesis:", error);
        // Se falhar ao retomar, cancela e limpa o estado
        speechSynthesis.cancel();
        setIsPaused(false);
        setIsPlaying(false);
        setCurrentUtterance(null);
        throw error; // Re-throw para que o calling code saiba que falhou
      }
    } else {
      console.warn("Cannot resume - no valid paused utterance. currentUtterance:", !!currentUtterance, "isPaused:", isPaused);
      throw new Error("No valid paused utterance to resume");
    }
  }, [currentUtterance, isPaused]);

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    setCurrentText("");
    setRemainingText("");
  }, []);

  return { 
    playText, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    isPlaying, 
    isPaused,
    currentText,
    remainingText,
    currentUtterance 
  };
}
