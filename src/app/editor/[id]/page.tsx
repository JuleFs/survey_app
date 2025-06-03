"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, type Survey } from "@/lib/api"

interface Question {
  id: string
  question_text: string
  question_type: "likert" | "yesno" | "numeric"
  is_required: boolean
  question_order: number
}

interface SurveyData {
  title: string
  description: string
  is_active: boolean
  questions: Question[]
}

export default function EditSurvey({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [survey, setSurvey] = useState<SurveyData>({
    title: "",
    description: "",
    is_active: true,
    questions: [],
  })
  const [originalSurvey, setOriginalSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSurvey()
  }, [id])

  const loadSurvey = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getSurvey(id)
      setOriginalSurvey(data)

      // Convertir los datos de la API al formato del editor
      const surveyData: SurveyData = {
        title: data.title,
        description: data.description || "",
        is_active: data.is_active,
        questions: data.questions
          .sort((a, b) => a.question_order - b.question_order)
          .map((q) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            question_order: q.question_order,
          })),
      }
      setSurvey(surveyData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la encuesta")
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `new_${Date.now()}`, // ID temporal para nuevas preguntas
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

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    setSurvey((prev) => {
      const newQuestions = [...prev.questions]
      const [movedQuestion] = newQuestions.splice(fromIndex, 1)
      newQuestions.splice(toIndex, 0, movedQuestion)

      // Actualizar el orden de todas las preguntas
      return {
        ...prev,
        questions: newQuestions.map((q, index) => ({ ...q, question_order: index })),
      }
    })
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

      const updateData = {
        title: survey.title,
        description: survey.description,
        is_active: survey.is_active,
        questions: survey.questions.map((q, index) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          question_order: index,
        })),
      }

      await api.updateSurvey(id, updateData)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la encuesta")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!originalSurvey) return false

    return (
      survey.title !== originalSurvey.title ||
      survey.description !== (originalSurvey.description || "") ||
      survey.is_active !== originalSurvey.is_active ||
      JSON.stringify(
        survey.questions.map((q) => ({
          text: q.question_text,
          type: q.question_type,
          required: q.is_required,
          order: q.question_order,
        })),
      ) !==
        JSON.stringify(
          originalSurvey.questions.map((q) => ({
            text: q.question_text,
            type: q.question_type,
            required: q.is_required,
            order: q.question_order,
          })),
        )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando encuesta...</span>
        </div>
      </div>
    )
  }

  if (error && !originalSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la encuesta</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadSurvey}>Reintentar</Button>
            <Link href="/">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Encuesta</h1>
            <p className="text-gray-600 mt-2">Modifica tu encuesta existente</p>
            {originalSurvey && (
              <p className="text-sm text-gray-500">
                Creada: {new Date(originalSurvey.created_at).toLocaleDateString("es-ES")}
              </p>
            )}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={survey.is_active}
                  onChange={(e) => setSurvey((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_active">Encuesta activa (permite recibir respuestas)</Label>
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
                    <div className="flex items-center gap-2">
                      {/* Botones para mover preguntas */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveQuestion(index, index - 1)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveQuestion(index, index + 1)}
                        disabled={index === survey.questions.length - 1}
                      >
                        ↓
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

                  {/* Indicador de pregunta existente vs nueva */}
                  <div className="text-xs text-gray-500">
                    {question.id.startsWith("new_") ? (
                      <span className="text-green-600">• Nueva pregunta</span>
                    ) : (
                      <span className="text-blue-600">• Pregunta existente</span>
                    )}
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

          {/* Información adicional */}
          {originalSurvey && (
            <Card>
              <CardHeader>
                <CardTitle>Información de la Encuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Creada:</p>
                    <p className="font-medium">{new Date(originalSurvey.created_at).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Última modificación:</p>
                    <p className="font-medium">{new Date(originalSurvey.updated_at).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado:</p>
                    <p className={`font-medium ${survey.is_active ? "text-green-600" : "text-red-600"}`}>
                      {survey.is_active ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {hasChanges() ? (
                <span className="text-orange-600">• Hay cambios sin guardar</span>
              ) : (
                <span className="text-green-600">• Todos los cambios guardados</span>
              )}
            </div>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline" disabled={saving}>
                  Cancelar
                </Button>
              </Link>
              <Button
                onClick={saveSurvey}
                disabled={!survey.title || survey.questions.length === 0 || saving || !hasChanges()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
