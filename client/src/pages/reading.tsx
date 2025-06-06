import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```

```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```

```
Remove description text
Replacing
<old_str>
<div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cartoon-dark mb-2">
          📖 Lição de Leitura
        </h1>
        <p className="text-gray-600 text-lg">
          Pratique sua pronúncia e compreensão de texto
        </p>
      </div>
</old_str>
with
<new_str>
<div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cartoon-dark mb-2">
          📖 Lição de Leitura
        </h1>
      </div>
</new_str>
```

```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```

```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```

```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```

```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```
```python
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
import { useLocation } from "wouter";

// Texto de exemplo baseado no tema da primeira aula
const sampleLessonText = `How Will We Eat in 2021?

The pandemic has changed many aspects of our daily lives, including how we eat and where we get our food. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever.

Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families.

Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before.

Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same.`;

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center border-4 border-cartoon-yellow">
            <CardHeader>
              <CardTitle className="text-2xl text-cartoon-dark">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você completou a lição de leitura com sucesso!
              </p>
              <div className="space-y-2">
                <Button onClick={goBack} className="cartoon-button w-full">
                  <ArrowLeft size={20} />
                  Voltar às Lições
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Book className="text-cartoon-teal" size={28} />
            <h1 className="text-3xl font-bold text-cartoon-dark">
              Lição de Leitura
            </h1>
          </div>
        </div>

        <ReadingLesson
          title="How Will We Eat in 2021?"
          text="How Will We Eat in 2021? The pandemic has changed our relationship with food in ways both subtle and dramatic. Restaurants have adapted to new safety protocols, while home cooking has become more popular than ever. Many people have discovered the joy of cooking at home. They have learned to prepare meals that were once only available in restaurants. Online grocery shopping has also become a necessity for many families. Food delivery services have seen unprecedented growth during this time. These companies have hired thousands of new drivers to meet the increased demand. Many restaurants now offer takeout and delivery options that they never had before. Looking ahead to 2021, experts predict that these changes will continue to shape how we eat. Home cooking will likely remain popular, and restaurants will continue to innovate with new service models. The way we think about food and dining may never be the same."
          onComplete={handleLessonComplete}
        />
      </div>
    </div>
  );
}
```