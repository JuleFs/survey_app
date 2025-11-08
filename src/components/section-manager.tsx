"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical, FolderOpen } from "lucide-react"

export interface SectionData {
  id: string
  title: string
  description: string
  section_order: number
}

interface SectionManagerProps {
  sections: SectionData[]
  onSectionsChange: (sections: SectionData[]) => void
}

export function SectionManager({ sections, onSectionsChange }: SectionManagerProps) {
  const addSection = () => {
    const newSection: SectionData = {
      id: `section_${Date.now()}`,
      title: "",
      description: "",
      section_order: sections.length,
    }
    onSectionsChange([...sections, newSection])
  }

  const updateSection = (id: string, field: keyof SectionData, value: any) => {
    const updatedSections = sections.map((section) => (section.id === id ? { ...section, [field]: value } : section))
    onSectionsChange(updatedSections)
  }

  const removeSection = (id: string) => {
    const filteredSections = sections
      .filter((section) => section.id !== id)
      .map((section, index) => ({ ...section, section_order: index }))
    onSectionsChange(filteredSections)
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)

    // Actualizar el orden de todas las secciones
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      section_order: index,
    }))
    onSectionsChange(reorderedSections)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Secciones de la Encuesta ({sections.length})
        </CardTitle>
        <Button onClick={addSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Sección
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay secciones creadas</p>
            <p className="text-sm">Las secciones te ayudan a organizar las preguntas por temas</p>
            <Button onClick={addSection} className="mt-4 bg-transparent" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Sección
            </Button>
          </div>
        )}

        {sections.map((section, index) => (
          <div key={section.id} className="border rounded-lg p-4 space-y-4 bg-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <h4 className="font-medium text-blue-800">Sección {index + 1}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveSection(index, index - 1)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveSection(index, index + 1)}
                  disabled={index === sections.length - 1}
                >
                  ↓
                </Button>
                <Button variant="outline" size="sm" onClick={() => removeSection(section.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título de la Sección *</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, "title", e.target.value)}
                  placeholder="Ej: Información Personal, Evaluación del Servicio"
                />
              </div>
              <div>
                <Label>Descripción (opcional)</Label>
                <Textarea
                  value={section.description}
                  onChange={(e) => updateSection(section.id, "description", e.target.value)}
                  placeholder="Breve descripción de esta sección"
                  rows={2}
                />
              </div>
            </div>

            {/* Vista previa de la sección */}
            <div className="bg-white p-3 rounded border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-600 mb-1">Vista previa:</p>
              <h5 className="font-semibold text-blue-700">{section.title || `Sección ${index + 1}`}</h5>
              {section.description && <p className="text-sm text-gray-600 mt-1">{section.description}</p>}
            </div>
          </div>
        ))}

        {sections.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información sobre Secciones:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Las secciones ayudan a organizar las preguntas por temas</li>
              <li>• Cada pregunta puede asignarse a una sección específica</li>
              <li>• Las secciones aparecerán como separadores en el PDF</li>
              <li>• Puedes reordenar las secciones usando los botones ↑ ↓</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
