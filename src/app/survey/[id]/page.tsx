"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  api,
  type Survey,
  type QuestionResponseCreate,
  type SectionWithQuestions,
} from "@/lib/api";

interface Response {
  questionId: string;
  value: string | number;
}

export default function SurveyResponse({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    loadSurvey();
  }, [resolvedParams.id]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSurvey(resolvedParams.id);
      setSurvey(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la encuesta"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: string, value: string | number) => {
    setResponses((prev) => {
      const existing = prev.find((r) => r.questionId === questionId);
      if (existing) {
        return prev.map((r) =>
          r.questionId === questionId ? { ...r, value } : r
        );
      }
      return [...prev, { questionId, value }];
    });
  };

  const getResponseValue = (questionId: string) => {
    return responses.find((r) => r.questionId === questionId)?.value;
  };

  const submitSurvey = async () => {
    if (!survey) return;

    try {
      setSubmitting(true);
      setError(null);

      const apiResponses: QuestionResponseCreate[] = responses.map(
        (response) => ({
          question_id: response.questionId,
          response_value: response.value.toString(),
        })
      );

      await api.submitResponse(survey.id, {
        survey_id: survey.id,
        responses: apiResponses,
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar las respuestas"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (!survey) return false;
    const allQuestions = [
      ...survey.questions,
      ...survey.sections.flatMap((section) => section.questions),
    ];
    const requiredQuestions = allQuestions.filter((q) => q.is_required);
    return requiredQuestions.every((q) =>
      responses.some((r) => r.questionId === q.id && r.value !== undefined)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando encuesta...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadSurvey}>Reintentar</Button>
            <Link href="/">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Encuesta no encontrada
          </h2>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ¡Gracias por tu respuesta!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu respuesta ha sido enviada exitosamente.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions =
    survey.questions.length +
    survey.sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {survey.header_image_url && (
          <div className="mx-auto mb-6">
            <img
              src={survey.header_image_url || "/placeholder.svg"}
              alt="Cabecera"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-gray-600 mt-2">{survey.description}</p>
          </div>
        </div>

        {survey.instructions && (
          <div className="mx-auto mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones</h3>
            <p className="text-blue-800 text-sm">{survey.instructions}</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Responder Encuesta</span>
                <span className="text-sm font-normal text-gray-500">
                  {responses.length} de {totalQuestions} respondidas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {survey.sections.map(
                (section: SectionWithQuestions, sectionIndex: number) => (
                  <div
                    key={section.id}
                    className="border-b pb-8 last:border-b-0"
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-8">
                      {section.questions
                        .sort((a, b) => a.question_order - b.question_order)
                        .map((question, questionIndex) => (
                          <QuestionComponent
                            key={question.id}
                            question={question}
                            questionNumber={questionIndex + 1}
                            totalInSection={section.questions.length}
                            showNumbers={true}
                            showAsterisk={question.is_required}
                            responseValue={getResponseValue(question.id)}
                            onResponse={(value) =>
                              handleResponse(question.id, value)
                            }
                          />
                        ))}
                    </div>
                  </div>
                )
              )}

              {survey.questions.length > 0 && (
                <div className="space-y-8">
                  {survey.questions
                    .sort((a, b) => a.question_order - b.question_order)
                    .map((question, index) => (
                      <QuestionComponent
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        totalInSection={survey.questions.length}
                        showNumbers={true}
                        showAsterisk={question.is_required}
                        responseValue={getResponseValue(question.id)}
                        onResponse={(value) =>
                          handleResponse(question.id, value)
                        }
                      />
                    ))}
                </div>
              )}

              <div>
                <Button
                  onClick={submitSurvey}
                  disabled={!canSubmit() || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Respuestas
                    </>
                  )}
                </Button>
                {!canSubmit() && !submitting && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Por favor completa todas las preguntas obligatorias (*)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuestionComponent({
  question,
  questionNumber,
  totalInSection,
  showNumbers,
  showAsterisk,
  responseValue,
  onResponse,
}: {
  question: any;
  questionNumber: number;
  totalInSection: number;
  showNumbers: boolean;
  showAsterisk: boolean;
  responseValue: any;
  onResponse: (value: string | number) => void;
}) {
  return (
    <div key={question.id} className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {showNumbers && `${questionNumber}. `}
          {question.question_text}
          {showAsterisk && question.is_required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        {question.help_text && (
          <p className="text-sm text-gray-500 mt-1">{question.help_text}</p>
        )}
      </div>

      {question.question_image_url && (
        <img
          src={question.question_image_url || "/placeholder.svg"}
          alt="Imagen de pregunta"
          className="max-h-48 rounded-lg"
        />
      )}

      {question.question_type === "likert" && (
        <div>
          <div className="grid grid-cols-5 gap-2 mb-2 justify-items-center">
            {[5, 4, 3, 2, 1].map((value) => (
              <button
                key={value}
                onClick={() => onResponse(value)}
                className={`w-12 h-12 border-2 rounded-lg font-medium transition-colors ${
                  responseValue === value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {value === 1 && <span>1</span>}
                {value === 2 && <span>2</span>}
                {value === 3 && <span>3</span>}
                {value === 4 && <span>4</span>}
                {value === 5 && <span>5</span>}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs justify-items-center">
            <span>Totalmente de acuerdo</span>
            <span>De acuerdo</span>
            <span>
              Ni en acuerdo ni <br /> en desacuerdo
            </span>
            <span>En desacuerdo</span>
            <span>Totalmente en desacuerdo</span>
          </div>
        </div>
      )}

      {question.question_type === "yesno" && (
        <div className="flex gap-4">
          {["Sí", "No"].map((option) => (
            <button
              key={option}
              onClick={() => onResponse(option)}
              className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                responseValue === option
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.question_type === "numeric" && (
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="10"
            value={responseValue || 0}
            onChange={(e) => onResponse(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>0</span>
            <span className="font-medium">
              Valor seleccionado: {responseValue || 0}
            </span>
            <span>10</span>
          </div>
        </div>
      )}
    </div>
  );
}
