"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/Button";
import { LessonCompleteModal, OutOfHeartsModal } from "@/components/lesson/Modals";

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
  pair_key?: string;
}

interface Exercise {
  id: number;
  type: "MULTIPLE_CHOICE" | "WORD_BANK" | "MATCH_PAIRS" | "TYPE_ANSWER";
  prompt: string;
  correct_solution: string;
  options: Option[];
}

interface LessonData {
  id: number;
  title: string;
  base_xp: number;
  exercises: Exercise[];
}

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);

  // Exercise Inputs State
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedPairWord, setSelectedPairWord] = useState<Option | null>(null);

  // Status: "idle" | "correct" | "incorrect" | "completed" | "out_of_hearts"
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect" | "completed" | "out_of_hearts">("idle");
  const [stats, setStats] = useState({ xp: 15, streak: 3 });

  // 1. Fetch Lesson & User Initial State
  useEffect(() => {
    async function loadData() {
      try {
        const [lessRes, userRes] = await Promise.all([
          fetch(`http://localhost:8000/api/lessons/${lessonId}`),
          fetch("http://localhost:8000/api/user"),
        ]);
        const lessonData = await lessRes.json();
        const userData = await userRes.json();

        setLesson(lessonData);
        setHearts(userData.hearts);

        if (lessonData.exercises.length > 0) {
          initializeExercise(lessonData.exercises[0]);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  const initializeExercise = (ex: Exercise) => {
    setSelectedOptionId(null);
    setTypedAnswer("");
    setSelectedPairWord(null);
    if (ex.type === "WORD_BANK") {
      setAvailableWords(ex.options.map((o) => o.text));
      setSelectedWords([]);
    } else if (ex.type === "MATCH_PAIRS") {
      setMatchedPairs([]);
    }
  };

  const currentExercise = lesson?.exercises[currentIdx];

  // 2. Validate Current Exercise Answer
  const checkAnswer = async () => {
    if (!currentExercise) return;
    let isCorrect = false;

    if (currentExercise.type === "MULTIPLE_CHOICE") {
      const chosen = currentExercise.options.find((o) => o.id === selectedOptionId);
      isCorrect = !!chosen?.is_correct;
    } else if (currentExercise.type === "WORD_BANK") {
      const built = selectedWords.join(" ").trim().toLowerCase();
      isCorrect = built === currentExercise.correct_solution.trim().toLowerCase();
    } else if (currentExercise.type === "TYPE_ANSWER") {
      isCorrect = typedAnswer.trim().toLowerCase() === currentExercise.correct_solution.trim().toLowerCase();
    } else if (currentExercise.type === "MATCH_PAIRS") {
      isCorrect = matchedPairs.length === currentExercise.options.length;
    }

    if (isCorrect) {
      setStatus("correct");
    } else {
      setStatus("incorrect");
      // Deduct heart in DB
      try {
        const res = await fetch("http://localhost:8000/api/user/deduct-heart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1 }),
        });
        const data = await res.json();
        setHearts(data.hearts);
        if (data.hearts <= 0) {
          setStatus("out_of_hearts");
        }
      } catch (err) {
        console.error("Heart deduction error:", err);
      }
    }
  };

  // 3. Move Next or Complete
  const handleContinue = async () => {
    if (!lesson) return;

    if (currentIdx + 1 < lesson.exercises.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setStatus("idle");
      initializeExercise(lesson.exercises[nextIdx]);
    } else {
      // Mark Lesson Completed in DB
      try {
        const res = await fetch(`http://localhost:8000/api/lessons/${lessonId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1 }),
        });
        const resData = await res.json();
        setStats({ xp: resData.xp_earned, streak: resData.streak });
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        setStatus("completed");
      } catch (err) {
        console.error("Complete lesson error:", err);
      }
    }
  };

  const refillHearts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/user/refill-hearts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1 }),
      });
      const data = await res.json();
      setHearts(data.hearts);
      setStatus("idle");
    } catch (err) {
      console.error("Refill error:", err);
    }
  };

  if (loading || !lesson || !currentExercise) {
    return (
      <div className="flex justify-center items-center h-screen font-extrabold text-[#58cc02] text-xl">
        Loading Lesson...
      </div>
    );
  }

  const progressPercentage = ((currentIdx + 1) / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header with Progress Bar & Hearts */}
      <header className="max-w-4xl mx-auto w-full pt-8 px-6 flex items-center gap-6">
        <Link href="/">
          <X className="w-7 h-7 text-[#afafaf] hover:text-[#4b4b4b] cursor-pointer" />
        </Link>
        <div className="flex-1 bg-[#e5e5e5] h-4 rounded-full overflow-hidden">
          <div
            className="bg-[#58cc02] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 font-black text-[#ff4b4b]">
          <Heart className="w-7 h-7 fill-[#ff4b4b]" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Main Question Container */}
      <main className="max-w-2xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-black text-[#4b4b4b] mb-8">{currentExercise.prompt}</h1>

        {/* 1. Multiple Choice Type */}
        {currentExercise.type === "MULTIPLE_CHOICE" && (
          <div className="grid grid-cols-1 gap-3">
            {currentExercise.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`p-4 rounded-2xl border-2 border-b-4 font-bold text-lg text-left transition-all ${
                  selectedOptionId === option.id
                    ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6]"
                    : "border-[#e5e5e5] hover:bg-[#f7f7f7] text-[#4b4b4b]"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* 2. Word Bank (Tap-to-assemble) */}
        {currentExercise.type === "WORD_BANK" && (
          <div>
            <div className="min-h-[80px] border-b-2 border-[#e5e5e5] p-3 flex flex-wrap gap-2 mb-8">
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedWords(selectedWords.filter((_, i) => i !== index));
                    setAvailableWords([...availableWords, word]);
                  }}
                  className="bg-white border-2 border-[#e5e5e5] border-b-4 px-4 py-2 rounded-2xl font-bold text-base shadow-sm"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedWords([...selectedWords, word]);
                    setAvailableWords(availableWords.filter((_, i) => i !== index));
                  }}
                  className="bg-white border-2 border-[#e5e5e5] border-b-4 px-4 py-2 rounded-2xl font-bold text-base shadow-sm hover:bg-[#f7f7f7]"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Match Pairs */}
        {currentExercise.type === "MATCH_PAIRS" && (
          <div className="grid grid-cols-2 gap-4">
            {currentExercise.options.map((option) => {
              const isMatched = matchedPairs.includes(option.text);
              const isSelected = selectedPairWord?.id === option.id;

              return (
                <button
                  key={option.id}
                  disabled={isMatched}
                  onClick={() => {
                    if (!selectedPairWord) {
                      setSelectedPairWord(option);
                    } else {
                      if (
                        selectedPairWord.pair_key === option.pair_key &&
                        selectedPairWord.id !== option.id
                      ) {
                        setMatchedPairs([...matchedPairs, selectedPairWord.text, option.text]);
                      }
                      setSelectedPairWord(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 border-b-4 font-bold text-base transition-all ${
                    isMatched
                      ? "opacity-30 border-transparent bg-transparent cursor-not-allowed"
                      : isSelected
                      ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6]"
                      : "border-[#e5e5e5] hover:bg-[#f7f7f7] text-[#4b4b4b]"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Type Answer */}
        {currentExercise.type === "TYPE_ANSWER" && (
          <div>
            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your translation here..."
              rows={3}
              className="w-full border-2 border-[#e5e5e5] rounded-2xl p-4 font-medium text-lg focus:outline-none focus:border-[#1cb0f6] resize-none"
            />
          </div>
        )}
      </main>

      {/* Signature Duolingo Bottom Feedback Bar */}
      <footer
        className={`w-full border-t-2 py-6 px-8 transition-colors duration-200 ${
          status === "correct"
            ? "bg-[#d7ffb8] border-[#bcf193]"
            : status === "incorrect"
            ? "bg-[#ffdfe0] border-[#fbc3c6]"
            : "bg-white border-[#e5e5e5]"
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {status === "correct" && (
              <div className="text-[#58cc02] font-black text-2xl">Awesome! You got it right!</div>
            )}
            {status === "incorrect" && (
              <div>
                <div className="text-[#ff4b4b] font-black text-2xl">Not quite!</div>
                <div className="text-[#ea2b2b] text-sm font-bold mt-1">
                  Correct solution: {currentExercise.correct_solution}
                </div>
              </div>
            )}
          </div>

          {status === "idle" ? (
            <Button variant="primary" onClick={checkAnswer}>
              Check
            </Button>
          ) : (
            <Button
              variant={status === "correct" ? "primary" : "danger"}
              onClick={handleContinue}
            >
              Continue
            </Button>
          )}
        </div>
      </footer>

      {/* Modals */}
      {status === "completed" && (
        <LessonCompleteModal xpEarned={stats.xp} streak={stats.streak} />
      )}
      {status === "out_of_hearts" && <OutOfHeartsModal onRefill={refillHearts} />}
    </div>
  );
}