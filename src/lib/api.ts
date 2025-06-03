const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Tipos que coinciden con los schemas de la API
export interface Question {
  id: string
  question_text: string
  question_type: "likert" | "yesno" | "numeric"
  is_required: boolean
  question_order: number
  created_at: string
}

export interface Survey {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  is_active: boolean
  questions: Question[]
}

export interface SurveyWithStats extends Survey {
  total_responses: number
}

export interface QuestionResponseCreate {
  question_id: string
  response_value: string
}

export interface SurveyResponseCreate {
  survey_id: string
  respondent_id?: string
  responses: QuestionResponseCreate[]
}

export interface QuestionStat {
  question_id: string
  question_text: string
  question_type: string
  total_responses: number
  average_value?: number
  min_value?: number
  max_value?: number
  distribution: Record<string, number>
}

export interface SurveyStat {
  survey_id: string
  title: string
  total_responses: number
  questions: QuestionStat[]
}

// Funciones para interactuar con la API
export const api = {
  // Obtener todas las encuestas
  async getSurveys(): Promise<SurveyWithStats[]> {
    const response = await fetch(`${API_BASE_URL}/surveys`)
    if (!response.ok) {
      throw new Error("Error al obtener las encuestas")
    }
    return response.json()
  },

  // Obtener una encuesta específica
  async getSurvey(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`)
    if (!response.ok) {
      throw new Error("Error al obtener la encuesta")
    }
    return response.json()
  },

  // Crear una nueva encuesta
  async createSurvey(surveyData: {
    title: string
    description: string
    questions: Array<{
      question_text: string
      question_type: "likert" | "yesno" | "numeric"
      is_required: boolean
      question_order: number
    }>
  }): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    })
    if (!response.ok) {
      throw new Error("Error al crear la encuesta")
    }
    return response.json()
  },

  // Actualizar una encuesta
  async updateSurvey(
    id: string,
    surveyData: {
      title?: string
      description?: string
      is_active?: boolean
      questions?: Array<{
        question_text: string
        question_type: "likert" | "yesno" | "numeric"
        is_required: boolean
        question_order: number
      }>
    },
  ): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    })
    if (!response.ok) {
      throw new Error("Error al actualizar la encuesta")
    }
    return response.json()
  },

  // Eliminar una encuesta
  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Error al eliminar la encuesta")
    }
  },

  // Enviar respuesta a una encuesta
  async submitResponse(
    surveyId: string,
    responseData: SurveyResponseCreate,
  ): Promise<{ message: string; response_id: string }> {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responseData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error al enviar la respuesta")
    }
    return response.json()
  },

  // Obtener estadísticas de una encuesta
  async getSurveyStats(id: string): Promise<SurveyStat> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/stats`)
    if (!response.ok) {
      throw new Error("Error al obtener las estadísticas")
    }
    return response.json()
  },

  // Exportar datos de una encuesta
  async exportSurveyData(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/export`)
    if (!response.ok) {
      throw new Error("Error al exportar los datos")
    }
    return response.json()
  },
}
