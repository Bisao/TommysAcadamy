import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, User, Lock, Mail, Maximize, Minimize } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Mascot from "@/components/mascot";
import tommyLogoPath from "@assets/Tommy logo.png";
import Header from "@/components/header";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [rememberUsername, setRememberUsername] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().then(() => setIsFullscreen(true));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
      setIsFullscreen(true);
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
      setIsFullscreen(false);
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedAutoLogin = localStorage.getItem("autoLogin") === "true";
    const savedRememberUsername = localStorage.getItem("rememberUsername") === "true";

    if (savedRememberUsername && savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberUsername(true);
    }

    if (savedAutoLogin && savedUsername && savedPassword) {
      setFormData(prev => ({ ...prev, username: savedUsername, password: savedPassword }));
      setAutoLogin(true);
      setRememberUsername(true);
      
      // Perform auto login after component is fully loaded
      setTimeout(() => {
        loginMutation.mutate({ username: savedUsername, password: savedPassword });
      }, 500);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      // Save username if remember is checked
      if (rememberUsername) {
        localStorage.setItem("rememberedUsername", formData.username);
        localStorage.setItem("rememberUsername", "true");
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberUsername");
      }

      // Save credentials if auto login is checked
      if (autoLogin) {
        localStorage.setItem("savedPassword", formData.password);
        localStorage.setItem("autoLogin", "true");
      } else {
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("autoLogin");
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Entrando em modo fullscreen...",
      });
      
      // Enter fullscreen mode
      setTimeout(() => {
        enterFullscreen();
      }, 500);
      
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to home after a delay to allow fullscreen to activate
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Usuário ou senha incorretos");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Entrando em modo fullscreen...",
      });
      
      // Enter fullscreen mode
      setTimeout(() => {
        enterFullscreen();
      }, 500);
      
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to home after a delay to allow fullscreen to activate
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Erro ao criar conta. Tente outro nome de usuário.");
    },
  });

  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/guest", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entrando como convidado!",
        description: "Entrando em modo fullscreen...",
      });
      
      // Enter fullscreen mode
      setTimeout(() => {
        enterFullscreen();
      }, 500);
      
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to home after a delay to allow fullscreen to activate
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Erro ao entrar como convidado. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!formData.username || !formData.password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Fullscreen Toggle Button */}
      <Button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 z-50 cartoon-button-secondary p-2"
        size="sm"
        title={isFullscreen ? "Sair do modo fullscreen" : "Entrar em modo fullscreen"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </Button>

      <div className="w-full lg:max-w-7xl mx-auto lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between gap-8 lg:gap-16 lg:min-h-[80vh]"
        >
          {/* Logo Section - Left side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2"
          >
            <img 
              src={tommyLogoPath} 
              alt="Tommy's Academy Logo" 
              className="w-48 h-48 sm:w-56 sm:h-56 lg:w-96 lg:h-96 xl:w-[30rem] xl:h-[30rem] object-contain mb-6"
            />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-cartoon-dark mb-4">Tommy's Academy</h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-lg">
              {isLogin ? "Entre na sua conta" : "Crie sua conta"} e continue sua jornada de aprendizado!
            </p>
          </motion.div>

          {/* Login/Register Card - Right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md lg:w-1/2 lg:max-w-lg lg:flex lg:justify-center"
          >
            <Card className="cartoon-card border-cartoon-teal shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-cartoon-dark">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-cartoon-dark font-semibold">
                  Nome de usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    className="pl-10 h-12 text-base border-2 border-gray-300 focus:border-cartoon-teal touch-target"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Email (only for register) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cartoon-dark font-semibold">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      className="pl-10 h-12 text-base border-2 border-gray-300 focus:border-cartoon-teal touch-target"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-cartoon-dark font-semibold">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    className="pl-10 h-12 text-base border-2 border-gray-300 focus:border-cartoon-teal touch-target"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Remember Options (only for login) */}
              {isLogin && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberUsername"
                      checked={rememberUsername}
                      onCheckedChange={(checked) => setRememberUsername(checked as boolean)}
                    />
                    <Label htmlFor="rememberUsername" className="text-sm text-cartoon-dark">
                      Lembrar nome de usuário
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoLogin"
                      checked={autoLogin}
                      onCheckedChange={(checked) => {
                        const isChecked = checked as boolean;
                        setAutoLogin(isChecked);
                        if (isChecked) {
                          setRememberUsername(true); // Auto login requires remembering username
                        }
                      }}
                    />
                    <Label htmlFor="autoLogin" className="text-sm text-cartoon-dark">
                      Login automático
                    </Label>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="border-cartoon-red bg-red-50">
                  <AlertDescription className="text-cartoon-red">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending || registerMutation.isPending || guestLoginMutation.isPending}
                className="w-full cartoon-button h-10 sm:h-12 text-base sm:text-lg"
              >
                {loginMutation.isPending || registerMutation.isPending
                  ? "Processando..."
                  : isLogin
                  ? "Entrar"
                  : "Criar Conta"}
              </Button>
            </form>

            {/* Guest Login Button */}
            {isLogin && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={guestLoginMutation.isPending || loginMutation.isPending || registerMutation.isPending}
                  onClick={() => guestLoginMutation.mutate()}
                  className="w-full mt-4 h-10 sm:h-12 text-base sm:text-lg border-2 border-gray-300 hover:border-cartoon-teal hover:bg-cartoon-teal/10 transition-colors"
                >
                  {guestLoginMutation.isPending ? "Entrando..." : "Entrar como Convidado"}
                </Button>
              </div>
            )}

            {/* Toggle Login/Register */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-sm sm:text-base text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({ username: "", email: "", password: "" });
                }}
                className="text-cartoon-teal font-semibold text-sm sm:text-base"
              >
                {isLogin ? "Criar nova conta" : "Fazer login"}
              </Button>
            </div>


          </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}