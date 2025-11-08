"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface PDFDownloadButtonProps {
  surveyId: string
  surveyTitle: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function PDFDownloadButton({
  surveyId,
  surveyTitle,
  variant = "outline",
  size = "sm",
  className = "",
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setLoading(true)
      setError(null)

      const fileName = `${surveyTitle.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`
      await api.downloadSurveyPDF(surveyId, fileName)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleDownload}
        disabled={loading}
        variant={variant}
        size={size}
        className={className}
        title="Descargar PDF de la encuesta"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-1" />
            PDF
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
