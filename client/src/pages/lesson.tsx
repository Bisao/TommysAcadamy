import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/header";
import LessonModal from "@/components/lesson-modal";
import { useState, useEffect } from "react";

export default function Lesson() {
  const [, params] = useRoute("/lesson/:id");
  const lessonId = params ? parseInt(params.id) : null;
  const [showLessonModal, setShowLessonModal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    if (lessonId) {
      setShowLessonModal(true);
    }
  }, [lessonId]);

  const closeLesson = () => {
    setShowLessonModal(false);
    // Navigate back to home
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      <Header user={user} />
      
      {showLessonModal && lessonId && (
        <LessonModal
          lessonId={lessonId}
          onClose={closeLesson}
        />
      )}
    </div>
  );
}
