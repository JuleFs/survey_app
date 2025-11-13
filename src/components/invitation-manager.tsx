"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link2, Copy, CheckCircle, AlertCircle, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface InvitationManagerProps {
  surveyId: string
  surveyTitle: string
}

export function InvitationManager({ surveyId, surveyTitle }: InvitationManagerProps) {
  const [expiresInHours, setExpiresInHours] = useState("24")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invitations, setInvitations] = useState<any[]>([])
  const [showList, setShowList] = useState(false)

  const generateInvitation = async () => {
    try {
      setLoading(true)
      const result = await api.createInvitation(surveyId, Number(expiresInHours))

      const shareUrl = `${window.location.origin}${result.share_url}`

      // Copiar al portapapeles automáticamente
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast.success("Link generado y copiado al portapapeles")

      // Actualizar lista
      loadInvitations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar link")
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const result = await api.getInvitations(surveyId)
      setInvitations(result.invitations || [])
    } catch (error) {
      toast.error("Error al cargar invitaciones")
    }
  }

  const deactivateInvitation = async (token: string) => {
    try {
      await api.deactivateInvitation(surveyId, token)
      toast.success("Invitación desactivada")
      loadInvitations()
    } catch (error) {
      toast.error("Error al desactivar invitación")
    }
  }

  const copyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/survey/${surveyId}?token=${token}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Link copiado al portapapeles")
  }

  const formatExpirationDate = (expiresAt: string) => {
    const date = new Date(expiresAt)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Compartir Encuesta
        </CardTitle>
        <CardDescription>Genera links para que otros usuarios respondan tu encuesta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generador de links */}
        <div className="space-y-4">
          <div>
            <Label>Duración del link (horas)</Label>
            <Select value={expiresInHours} onValueChange={setExpiresInHours}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hora</SelectItem>
                <SelectItem value="24">24 horas (1 día)</SelectItem>
                <SelectItem value="72">72 horas (3 días)</SelectItem>
                <SelectItem value="168">168 horas (1 semana)</SelectItem>
                <SelectItem value="720">720 horas (30 días)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateInvitation} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Generar Link Compartible
              </>
            )}
          </Button>

          {copied && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Link copiado al portapapeles</span>
            </div>
          )}
        </div>

        {/* Lista de invitaciones */}
        <div>
          <Button
            variant="outline"
            onClick={() => {
              setShowList(!showList)
              if (!showList) loadInvitations()
            }}
            className="w-full"
          >
            Ver links generados
          </Button>

          {showList && (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {invitations.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No hay invitaciones generadas aún</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">{invitation.token}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyLink(invitation.token)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Respuestas:</span> {invitation.responses_count}
                      </div>
                      <div className="text-right">
                        {invitation.is_expired ? (
                          <span className="text-red-600">Expirado</span>
                        ) : invitation.is_active ? (
                          <span className="text-green-600">Activo</span>
                        ) : (
                          <span className="text-gray-500">Desactivado</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">Expira: {formatExpirationDate(invitation.expires_at)}</div>

                    {!invitation.is_expired && invitation.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateInvitation(invitation.token)}
                        className="w-full"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Desactivar
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Información sobre respuestas únicas */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Una respuesta por dispositivo</p>
              <p>Cada dispositivo solo puede responder una vez la encuesta, incluso con links diferentes.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
