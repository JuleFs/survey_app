"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Settings,
  FileText,
  Palette,
  Eye,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type PDFSettings } from "@/lib/api";
import { ImageUpload } from "@/components/image-upload";
import { PDFPreview } from "@/components/pdf-preview";
import { SectionManager, type SectionData } from "@/components/section-manager";

interface Question {
  id: string;
  question_text: string;
  question_type: "likert" | "yesno" | "numeric";
  question_image_url?: string;
  help_text?: string;
  is_required: boolean;
  question_order: number;
  section_id?: string;
  created_at: string;
}

interface Survey {
  title: string;
  description: string;
  instructions: string;
  header_image_url?: string;
  footer_text: string;
  pdf_settings: PDFSettings;
  sections: SectionData[];
  questions: Question[];
}

export default function SurveyEditor() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey>({
    title: "",
    description: "",
    instructions: "",
    header_image_url: undefined,
    footer_text: "",
    pdf_settings: {
      page_size: "A4",
      orientation: "portrait",
      margins: { top: 20, bottom: 20, left: 15, right: 15 },
      include_header: true,
      include_footer: true,
    },
    sections: [],
    questions: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: "",
      question_type: "likert",
      question_image_url: undefined,
      help_text: "",
      is_required: true,
      created_at: new Date().toISOString(),
      question_order: survey.questions.length,
      section_id: undefined,
    };
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (id: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((q) => q.id !== id)
        .map((q, index) => ({ ...q, question_order: index })),
    }));
  };

  const saveSurvey = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!survey.title.trim()) {
        setError("El título es requerido");
        return;
      }

      if (survey.questions.length === 0) {
        setError("Debe agregar al menos una pregunta");
        return;
      }

      const emptyQuestions = survey.questions.filter(
        (q) => !q.question_text.trim()
      );
      if (emptyQuestions.length > 0) {
        setError("Todas las preguntas deben tener texto");
        return;
      }

      // Validar secciones si existen
      const emptySections =
        survey.sections.filter((s) => !s.title.trim()) || [];
      if (emptySections.length > 0) {
        setError("Todas las secciones deben tener título");
        return;
      }

      const surveyData = {
        title: survey.title,
        description: survey.description,
        instructions: survey.instructions,
        header_image_url: survey.header_image_url,
        footer_text: survey.footer_text,
        pdf_settings: survey.pdf_settings,
        is_active: true,
        sections: survey.sections.map((s, index) => ({
          title: s.title,
          description: s.description,
          section_order: index,
        })),
        questions: survey.questions.map((q, index) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          question_image_url: q.question_image_url,
          help_text: q.help_text,
          is_required: q.is_required,
          question_order: index,
          section_id: q.section_id,
        })),
      };

      await api.createSurvey(surveyData);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la encuesta"
      );
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      // Simular generación de PDF
      console.log("Generando PDF con configuración:", survey.pdf_settings);
      alert("PDF generado exitosamente (funcionalidad simulada)");
    } catch (err) {
      setError("Error al generar el PDF");
    }
  };

  // Obtener preguntas organizadas por sección para la vista previa
  const getOrganizedSurvey = () => {
    const sectionsWithQuestions = survey.sections.map((section) => ({
      ...section,
      survey_id: "preview",
      created_at: new Date().toISOString(),
      questions: survey.questions
        .filter((q) => q.section_id === section.id)
        .map((q) => ({
          ...q,
          survey_id: "preview",
          created_at: new Date().toISOString(),
        })),
    }));

    const questionsWithoutSection = survey.questions
      .filter((q) => !q.section_id)
      .map((q) => ({
        ...q,
        survey_id: "preview",
        created_at: new Date().toISOString(),
      }));

    return {
      ...survey,
      id: "preview",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      sections: sectionsWithQuestions,
      questions: questionsWithoutSection,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Encuesta</h1>
            <p className="text-gray-600 mt-2">
              Diseña tu encuesta con secciones organizadas para PDF
            </p>
          </div>
        </div>

        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Información
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Secciones ({survey.sections.length})
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Preguntas ({survey.questions.length})
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Vista Previa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título de la Encuesta *</Label>
                        <Input
                          id="title"
                          value={survey.title}
                          onChange={(e) =>
                            setSurvey((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Ingresa el título de tu encuesta"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={survey.description}
                          onChange={(e) =>
                            setSurvey((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Breve descripción de la encuesta"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instructions">
                          Instrucciones Detalladas
                        </Label>
                        <Textarea
                          id="instructions"
                          value={survey.instructions}
                          onChange={(e) =>
                            setSurvey((prev) => ({
                              ...prev,
                              instructions: e.target.value,
                            }))
                          }
                          placeholder="Instrucciones completas para los encuestados (aparecerán en el PDF)"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="footer">Texto de Pie de Página</Label>
                        <Input
                          id="footer"
                          value={survey.footer_text}
                          onChange={(e) =>
                            setSurvey((prev) => ({
                              ...prev,
                              footer_text: e.target.value,
                            }))
                          }
                          placeholder="Texto que aparecerá al final de la encuesta"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Imagen de Cabecera</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ImageUpload
                        value={survey.header_image_url}
                        onChange={(url) =>
                          setSurvey((prev) => ({
                            ...prev,
                            header_image_url: url,
                          }))
                        }
                        label="Subir logo o imagen de cabecera"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Esta imagen aparecerá en la parte superior de la
                        encuesta y del PDF
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6">
              <SectionManager
                sections={survey.sections}
                onSectionsChange={(sections) =>
                  setSurvey((prev) => ({ ...prev, sections }))
                }
              />
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Preguntas ({survey.questions.length})</CardTitle>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Pregunta
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {survey.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Pregunta {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Texto de la pregunta *</Label>
                            <Textarea
                              value={question.question_text}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "question_text",
                                  e.target.value
                                )
                              }
                              placeholder="Escribe tu pregunta aquí"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label>Texto de ayuda (opcional)</Label>
                            <Input
                              value={question.help_text || ""}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "help_text",
                                  e.target.value
                                )
                              }
                              placeholder="Instrucciones adicionales para esta pregunta"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Sección</Label>
                              <Select
                                value={question.section_id || "none"}
                                onValueChange={(value) =>
                                  updateQuestion(
                                    question.id,
                                    "section_id",
                                    value === "none" ? undefined : value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sin sección" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    Sin sección
                                  </SelectItem>
                                  {survey.sections.map((section) => (
                                    <SelectItem
                                      key={section.id}
                                      value={section.id}
                                    >
                                      {section.title ||
                                        `Sección ${section.section_order + 1}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Tipo de escala</Label>
                              <Select
                                value={question.question_type}
                                onValueChange={(value) =>
                                  updateQuestion(
                                    question.id,
                                    "question_type",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="likert">
                                    Escala Likert (1-5)
                                  </SelectItem>
                                  <SelectItem value="yesno">Sí / No</SelectItem>
                                  <SelectItem value="numeric">
                                    Numérica (0-10)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`required-${question.id}`}
                                checked={question.is_required}
                                onChange={(e) =>
                                  updateQuestion(
                                    question.id,
                                    "is_required",
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              <Label htmlFor={`required-${question.id}`}>
                                Obligatoria
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Imagen de la pregunta (opcional)</Label>
                          <ImageUpload
                            value={question.question_image_url}
                            onChange={(url) =>
                              updateQuestion(
                                question.id,
                                "question_image_url",
                                url
                              )
                            }
                            label="Subir imagen"
                            maxSize={2}
                          />
                        </div>
                      </div>

                      {/* Preview de la pregunta */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          Vista previa:
                        </p>
                        <div className="space-y-2">
                          {/* Mostrar sección si está asignada */}
                          {question.section_id && (
                            <div className="text-xs text-blue-600 font-medium">
                              📁{" "}
                              {survey.sections.find(
                                (s) => s.id === question.section_id
                              )?.title || "Sección"}
                            </div>
                          )}
                          {question.help_text && (
                            <p className="text-sm text-gray-600">
                              {question.help_text}
                            </p>
                          )}
                          {question.question_image_url && (
                            <img
                              src={
                                question.question_image_url ||
                                "/placeholder.svg"
                              }
                              alt="Preview"
                              className="max-h-24 rounded"
                            />
                          )}

                          <div className="mt-3">
                            {question.question_type === "likert" && (
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    className="w-8 h-8 border rounded text-sm"
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            )}
                            {question.question_type === "yesno" && (
                              <div className="flex gap-4">
                                <button className="px-4 py-2 border rounded text-sm">
                                  Sí
                                </button>
                                <button className="px-4 py-2 border rounded text-sm">
                                  No
                                </button>
                              </div>
                            )}
                            {question.question_type === "numeric" && (
                              <input
                                type="range"
                                min="0"
                                max="10"
                                className="w-full"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {survey.questions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No hay preguntas agregadas</p>
                      <p className="text-sm">
                        Haz clic en "Agregar Pregunta" para comenzar
                      </p>
                    </div>
                  )}

                  {/* Resumen de preguntas por sección */}
                  {survey.sections.length > 0 &&
                    survey.questions.length > 0 && (
                      <Card className="bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Distribución de Preguntas por Sección
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {survey.sections.map((section) => {
                              const questionsInSection =
                                survey.questions.filter(
                                  (q) => q.section_id === section.id
                                );
                              return (
                                <div
                                  key={section.id}
                                  className="flex justify-between"
                                >
                                  <span>📁 {section.title}</span>
                                  <span className="font-medium">
                                    {questionsInSection.length} preguntas
                                  </span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between border-t pt-2">
                              <span>📄 Sin sección</span>
                              <span className="font-medium">
                                {
                                  survey.questions.filter((q) => !q.section_id)
                                    .length
                                }{" "}
                                preguntas
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <PDFPreview
                survey={getOrganizedSurvey()}
                onGeneratePDF={generatePDF}
              />
            </TabsContent>
          </Tabs>

          {/* Acciones */}
          <div className="flex justify-end gap-4 mt-8">
            <Link href="/">
              <Button variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={saveSurvey}
              disabled={
                !survey.title || survey.questions.length === 0 || saving
              }
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Encuesta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
