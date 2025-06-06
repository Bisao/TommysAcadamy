import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, User, Lock, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Mascot from "@/components/mascot";
import tommyLogoPath from "@assets/Tommy logo.png";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Tommy's Academy!",
      });
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to home
      setLocation("/");
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
        description: "Bem-vindo ao Tommy's Academy!",
      });
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to home
      setLocation("/");
    },
    onError: (error: any) => {
      setError("Erro ao criar conta. Tente outro nome de usuário.");
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
            <img 
              src={tommyLogoPath} 
              alt="Tommy's Academy Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cartoon-dark text-center sm:text-left">Tommy's Academy</h1>
          </div>
          <div className="flex justify-center mb-4">
            <Mascot />
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"} e continue sua jornada de aprendizado!
          </p>
        </div>

        {/* Login/Register Card */}
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
                    className="pl-10 h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 focus:border-cartoon-teal"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
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
                      className="pl-10 h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 focus:border-cartoon-teal"
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
                    className="pl-10 h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 focus:border-cartoon-teal"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </div>
              </div>

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
                disabled={loginMutation.isPending || registerMutation.isPending}
                className="w-full cartoon-button h-10 sm:h-12 text-base sm:text-lg"
              >
                {loginMutation.isPending || registerMutation.isPending
                  ? "Processando..."
                  : isLogin
                  ? "Entrar"
                  : "Criar Conta"}
              </Button>
            </form>

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

            {/* Demo Account Info */}
            <div className="mt-6 p-4 bg-cartoon-yellow/20 rounded-lg">
              <p className="text-sm text-cartoon-dark font-semibold mb-2">
                Conta de demonstração:
              </p>
              <p className="text-sm text-gray-600">
                Usuário: <span className="font-mono">learner</span><br />
                Senha: <span className="font-mono">password123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}