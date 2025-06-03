"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Question {
  id: string
  question_text: string
  question_type: "likert" | "yesno" | "numeric"
  is_required: boolean
  question_order: number
}

interface Survey {
  title: string
  description: string
  questions: Question[]
}

export default function SurveyEditor() {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey>({
    title: "",
    description: "",
    questions: [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: "",
      question_type: "likert",
      is_required: true,
      question_order: survey.questions.length,
    }
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    }))
  }

  const removeQuestion = (id: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id).map((q, index) => ({ ...q, question_order: index })),
    }))
  }

  const saveSurvey = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!survey.title.trim()) {
        setError("El título es requerido")
        return
      }

      if (survey.questions.length === 0) {
        setError("Debe agregar al menos una pregunta")
        return
      }

      // Validar que todas las preguntas tengan texto
      const emptyQuestions = survey.questions.filter((q) => !q.question_text.trim())
      if (emptyQuestions.length > 0) {
        setError("Todas las preguntas deben tener texto")
        return
      }

      const surveyData = {
        title: survey.title,
        description: survey.description,
        questions: survey.questions.map((q, index) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          question_order: index,
        })),
      }

      await api.createSurvey(surveyData)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la encuesta")
    } finally {
      setSaving(false)
    }
  }

  const getScaleTypeLabel = (type: string) => {
    switch (type) {
      case "likert":
        return "Escala Likert (1-5)"
      case "yesno":
        return "Sí / No"
      case "numeric":
        return "Numérica (0-10)"
      default:
        return type
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Editor de Encuesta</h1>
            <p className="text-gray-600 mt-2">Crea y configura tu encuesta</p>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Encuesta</Label>
                <Input
                  id="title"
                  value={survey.title}
                  onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ingresa el título de tu encuesta"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={survey.description}
                  onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito de tu encuesta"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preguntas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preguntas ({survey.questions.length})</CardTitle>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Pregunta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Pregunta {index + 1}</h4>
                    <Button variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label>Texto de la pregunta</Label>
                    <Input
                      value={question.question_text}
                      onChange={(e) => updateQuestion(question.id, "question_text", e.target.value)}
                      placeholder="Escribe tu pregunta aquí"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de escala</Label>
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => updateQuestion(question.id, "question_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="likert">Escala Likert (1-5)</SelectItem>
                          <SelectItem value="yesno">Sí / No</SelectItem>
                          <SelectItem value="numeric">Numérica (0-10)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.is_required}
                        onChange={(e) => updateQuestion(question.id, "is_required", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`required-${question.id}`}>Pregunta obligatoria</Label>
                    </div>
                  </div>

                  {/* Preview de la pregunta */}
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Vista previa:</p>
                    <p className="mb-2">{question.question_text || "Texto de la pregunta"}</p>
                    {question.question_type === "likert" && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button key={num} className="w-8 h-8 border rounded text-sm">
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                    {question.question_type === "yesno" && (
                      <div className="flex gap-4">
                        <button className="px-4 py-2 border rounded text-sm">Sí</button>
                        <button className="px-4 py-2 border rounded text-sm">No</button>
                      </div>
                    )}
                    {question.question_type === "numeric" && <input type="range" min="0" max="10" className="w-full" />}
                  </div>
                </div>
              ))}

              {survey.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay preguntas agregadas</p>
                  <p className="text-sm">Haz clic en "Agregar Pregunta" para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button onClick={saveSurvey} disabled={!survey.title || survey.questions.length === 0 || saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Encuesta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
