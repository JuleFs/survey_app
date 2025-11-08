"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface ImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  label?: string
  accept?: string
  maxSize?: number // en MB
}

export function ImageUpload({
  value,
  onChange,
  label = "Subir imagen",
  accept = "image/*",
  maxSize = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${maxSize}MB`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Por ahora simularemos la subida creando una URL temporal
      // En producción, aquí llamarías a api.uploadFile(file)
      const uploadedFile = await api.uploadFile(file)
      const imageUrl = URL.createObjectURL(file)
      onChange(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />

      {value ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={value || "/placeholder.svg"}
                alt="Imagen subida"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {label}
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">Máximo {maxSize}MB • JPG, PNG, GIF</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
