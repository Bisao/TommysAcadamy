import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import Reference from "@/pages/reference";
import Lesson from "@/pages/lesson";
import Vocabulary from "@/pages/vocabulary";
import Grammar from "@/pages/grammar";
import Phrases from "@/pages/phrases";
import Pronunciation from "@/pages/pronunciation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/reference" component={Reference} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;