"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, Edit, Eye, Loader2, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { api, type SurveyWithStats } from "@/lib/api"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { InvitationManager } from "@/components/invitation-manager"

export default function HomePage() {
  const [surveys, setSurveys] = useState<SurveyWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null)

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getSurveys()
      setSurveys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las encuestas")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta encuesta?")) {
      return
    }

    try {
      setDeletingId(id)
      await api.deleteSurvey(id)
      setSurveys(surveys.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la encuesta")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando encuestas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar las encuestas</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSurveys}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Encuestas</h1>
            <p className="text-gray-600 mt-2">Crea, gestiona y analiza tus encuestas</p>
            <p className="text-gray-600 mt-2">Selecciona una encuesta para generar link compartible</p>
          </div>
          <Link href="/editor">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Encuesta
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedSurvey && (
            <div className="lg:col-span-1">
              <InvitationManager
                surveyId={selectedSurvey}
                surveyTitle={surveys.find((s) => s.id === selectedSurvey)?.title || ""}
              />
            </div>
          )}

          <div className={selectedSurvey ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {surveys.map((survey) => (
                <Card
                  key={survey.id}
                  className={`hover:shadow-lg transition-shadow flex flex-col cursor-pointer ${
                    selectedSurvey === survey.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedSurvey(survey.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>{survey.questions.length} preguntas</span>
                      <span>{survey.total_responses} respuestas</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">Creada: {formatDate(survey.created_at)}</div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Link href={`/editor/${survey.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/survey/${survey.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/stats/${survey.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          <PDFDownloadButton
                            surveyId={survey.id}
                            surveyTitle={survey.title}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(survey.id)
                          }}
                          disabled={deletingId === survey.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === survey.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {surveys.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BarChart3 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay encuestas</h3>
                <p className="text-gray-600 mb-4">Comienza creando tu primera encuesta</p>
                <Link href="/editor">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Encuesta
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
