import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Profile from "@/pages/profile-new";
import Reference from "@/pages/reference";
import Reading from "@/pages/reading";
import Lesson from "@/pages/lesson";
import Lessons from "@/pages/lessons";
import Exercises from "@/pages/exercises";
import Vocabulary from "@/pages/vocabulary";
import Grammar from "@/pages/grammar";
import Phrases from "@/pages/phrases";
import Pronunciation from "@/pages/pronunciation";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={Home} />
      <Route path="/lessons" component={Lessons} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/profile" component={Profile} />
      <Route path="/reference" component={Reference} />
      <Route path="/reading" component={Reading} />
      <Route path="/lesson/:id" component={Lesson} />
      <Route path="/vocabulary" component={Vocabulary} />
      <Route path="/grammar" component={Grammar} />
      <Route path="/phrases" component={Phrases} />
      <Route path="/pronunciation" component={Pronunciation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="tommy-academy-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;