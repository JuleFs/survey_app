"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Users, BarChart3, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { api, type SurveyStat, type QuestionStat } from "@/lib/api"

export default function SurveyStats({ params }: { params: Promise<{ id: string }> }) {
  const [stats, setStats] = useState<SurveyStat | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resolvedParams = use(params)

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
    if (stats.sections.length === 0 && stats.questions.length === 0) return 0
    const totalQuestions = stats.sections.reduce((sum, s) => sum + s.questions.length, 0) + stats.questions.length
    const totalPossibleResponses = stats.total_responses * totalQuestions
    const actualResponses =
      stats.sections.reduce((sum, s) => sum + s.questions.reduce((qs, q) => qs + q.total_responses, 0), 0) +
      stats.questions.reduce((sum, q) => sum + q.total_responses, 0)
    return totalPossibleResponses > 0 ? Math.round((actualResponses / totalPossibleResponses) * 100) : 0
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#6B7280"]

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
                  <p className="text-2xl font-bold">
                    {stats.sections.reduce((sum, s) => sum + s.questions.length, 0) + stats.questions.length}
                  </p>
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
          {stats.sections.map((section, sectionIndex) => (
            <div key={section.section_id} className="border-b pb-6 last:border-b-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Sección: {section.section_title}</h3>

              <div className="grid grid-cols-1 gap-6">
                {section.questions.map((question) => (
                  <QuestionStatChart key={question.question_id} question={question} colors={COLORS} />
                ))}
              </div>
            </div>
          ))}

          {stats.questions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Preguntas Generales</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.questions.map((question) => (
                  <QuestionStatChart key={question.question_id} question={question} colors={COLORS} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionStatChart({
  question,
  colors,
}: {
  question: QuestionStat
  colors: string[]
}) {
  const pieData = Object.entries(question.distribution).map(([value, count]) => ({
    name: value,
    value: count,
  }))

  const likertLabelMap: Record<string, string> = {
    "5": "Totalmente de acuerdo",
    "4": "De acuerdo",
    "3": "Ni de acuerdo ni en desacuerdo",
    "2": "En desacuerdo",
    "1": "Totalmente en desacuerdo",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {question.total_responses} respuestas • Tipo: {question.question_type}
        </p>
      </CardHeader>
      <CardContent>
        {question.question_type === "likert" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Promedio:</span>
              <span className="text-xl font-bold text-blue-600">{question.average_value?.toFixed(1) || "N/A"}/5</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${likertLabelMap[String(name)] ?? name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} respuestas`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {question.question_type === "yesno" && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} respuestas`} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {question.question_type === "numeric" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Promedio:</span>
              <span className="text-xl font-bold text-purple-600">
                {question.average_value?.toFixed(1) || "N/A"}/10
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} respuestas`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {question.total_responses === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay respuestas para esta pregunta</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
