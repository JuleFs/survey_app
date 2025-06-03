"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Users, BarChart3, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { api, type SurveyStat } from "@/lib/api"

export default function SurveyStats({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [stats, setStats] = useState<SurveyStat | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [resolvedParams.id])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getSurveyStats(resolvedParams.id)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      setExporting(true)
      const data = await api.exportSurveyData(resolvedParams.id)

      // Crear y descargar el archivo JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `encuesta-${resolvedParams.id}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al exportar los datos")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadStats}>Reintentar</Button>
            <Link href="/">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Estadísticas no encontradas</h2>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const calculateCompletionRate = () => {
    if (stats.questions.length === 0) return 0
    const totalPossibleResponses = stats.total_responses * stats.questions.length
    const actualResponses = stats.questions.reduce((sum, q) => sum + q.total_responses, 0)
    return totalPossibleResponses > 0 ? Math.round((actualResponses / totalPossibleResponses) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
              <p className="text-gray-600 mt-2">{stats.title}</p>
            </div>
          </div>
          <Button onClick={exportData} variant="outline" disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar Datos
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Respuestas</p>
                  <p className="text-2xl font-bold">{stats.total_responses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preguntas</p>
                  <p className="text-2xl font-bold">{stats.questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Finalización</p>
                  <p className="text-2xl font-bold">{calculateCompletionRate()}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {stats.questions.map((question, index) => (
            <Card key={question.question_id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pregunta {index + 1}: {question.question_text}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {question.total_responses} respuestas • Tipo: {question.question_type}
                </p>
              </CardHeader>
              <CardContent>
                {question.question_type === "likert" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {question.average_value?.toFixed(1) || "N/A"}/5
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(question.distribution).map(([value, count]) => (
                        <div key={value} className="flex items-center gap-4">
                          <span className="w-8 text-sm">{value}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-blue-500 h-4 rounded-full"
                              style={{
                                width: `${question.total_responses > 0 ? (count / question.total_responses) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">
                            {count} (
                            {question.total_responses > 0 ? Math.round((count / question.total_responses) * 100) : 0}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.question_type === "yesno" && (
                  <div className="space-y-2">
                    {Object.entries(question.distribution).map(([value, count]) => (
                      <div key={value} className="flex items-center gap-4">
                        <span className="w-12 text-sm">{value}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div
                            className={`h-6 rounded-full ${value === "Sí" ? "bg-green-500" : "bg-red-500"}`}
                            style={{
                              width: `${question.total_responses > 0 ? (count / question.total_responses) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-16">
                          {count} (
                          {question.total_responses > 0 ? Math.round((count / question.total_responses) * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === "numeric" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <span className="text-xl font-bold text-purple-600">
                        {question.average_value?.toFixed(1) || "N/A"}/10
                      </span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Distribución de respuestas:</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 11 }, (_, i) => {
                          const count = question.distribution[i.toString()] || 0
                          const maxCount = Math.max(...Object.values(question.distribution))
                          const height = maxCount > 0 ? (count / maxCount) * 40 + 10 : 10
                          return (
                            <div key={i} className="flex-1 text-center">
                              <div
                                className="bg-purple-500 rounded-t mx-auto"
                                style={{
                                  height: `${height}px`,
                                  width: "80%",
                                  opacity: 0.7,
                                }}
                                title={`${i}: ${count} respuestas`}
                              />
                              <span className="text-xs text-gray-500">{i}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {question.total_responses === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay respuestas para esta pregunta</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}