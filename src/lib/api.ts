const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Tipos actualizados que coinciden con los schemas de la API
export interface PDFSettings {
  page_size: string;
  orientation: string;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  include_header: boolean;
  include_footer: boolean;
  watermark?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  section_order: number;
  survey_id: string;
  created_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: "likert" | "yesno" | "numeric";
  question_image_url?: string;
  help_text?: string;
  is_required: boolean;
  question_order: number;
  section_id?: string;
  created_at: string;
}

export interface SectionWithQuestions extends Section {
  questions: Question[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  header_image_url?: string;
  footer_text?: string;
  pdf_settings?: PDFSettings;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sections: SectionWithQuestions[];
  questions: Question[];
}

export interface SurveyWithStats extends Survey {
  total_responses: number;
}

export interface QuestionResponseCreate {
  question_id: string;
  response_value: string;
}

export interface SurveyResponseCreate {
  survey_id: string;
  respondent_id?: string;
  responses: QuestionResponseCreate[];
}

export interface QuestionStat {
  question_id: string;
  question_text: string;
  question_type: string;
  section_title?: string;
  total_responses: number;
  average_value?: number;
  min_value?: number;
  max_value?: number;
  distribution: Record<string, number>;
}

export interface SectionStat {
  section_id: string;
  section_title: string;
  questions: QuestionStat[];
}

export interface SurveyStat {
  survey_id: string;
  title: string;
  total_responses: number;
  sections: SectionStat[];
  questions: QuestionStat[];
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string;
  created_at: string;
}

// Funciones para interactuar con la API
export const api = {
  // Obtener todas las encuestas
  async getSurveys(): Promise<SurveyWithStats[]> {
    const response = await fetch(`${API_BASE_URL}/surveys`);
    if (!response.ok) {
      throw new Error("Error al obtener las encuestas");
    }
    return response.json();
  },

  // Obtener una encuesta específica
  async getSurvey(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener la encuesta");
    }
    return response.json();
  },

  // Crear una nueva encuesta
  async createSurvey(surveyData: {
    title: string;
    description: string;
    instructions?: string;
    header_image_url?: string;
    footer_text?: string;
    pdf_settings?: PDFSettings;
    is_active: boolean;
    sections: Array<{
      title: string;
      description?: string;
      section_order: number;
    }>;
    questions: Array<{
      question_text: string;
      question_type: "likert" | "yesno" | "numeric";
      question_image_url?: string;
      help_text?: string;
      is_required: boolean;
      question_order: number;
      section_id?: string;
    }>;
  }): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    });
    if (!response.ok) {
      throw new Error("Error al crear la encuesta");
    }
    return response.json();
  },

  // Actualizar una encuesta
  async updateSurvey(
    id: string,
    surveyData: {
      title?: string;
      description?: string;
      instructions?: string;
      header_image_url?: string;
      footer_text?: string;
      pdf_settings?: PDFSettings;
      is_active?: boolean;
      sections: Array<{
        title: string;
        description?: string;
        section_order: number;
      }>;
      questions?: Array<{
        question_text: string;
        question_type: "likert" | "yesno" | "numeric";
        question_image_url?: string;
        help_text?: string;
        is_required: boolean;
        question_order: number;
        section_id?: string;
      }>;
    }
  ): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar la encuesta");
    }
    return response.json();
  },

  // Subir archivo
  async uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Error al subir el archivo");
    }
    return response.json();
  },

  // Generar PDF de la encuesta
  async generatePDF(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/pdf`, {
      method: "GET",
    })
    if (!response.ok) {
      throw new Error("Error al generar el PDF")
    }
    return response.blob()
  },

  // Descargar PDF de la encuesta
  async downloadSurveyPDF(id: string, fileName?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/pdf`)
    if (!response.ok) {
      throw new Error("Error al descargar el PDF")
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName || `encuesta_${id}_${new Date().toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Eliminar una encuesta
  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la encuesta");
    }
  },

  // Enviar respuesta a una encuesta
  async submitResponse(
    surveyId: string,
    responseData: SurveyResponseCreate
  ): Promise<{ message: string; response_id: string }> {
    console.log("Enviando datos de respuesta:", responseData);
    const response = await fetch(
      `${API_BASE_URL}/surveys/${surveyId}/responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al enviar la respuesta");
    }
    return response.json();
  },

  // Obtener estadísticas de una encuesta
  async getSurveyStats(id: string): Promise<SurveyStat> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/stats`);
    if (!response.ok) {
      throw new Error("Error al obtener las estadísticas");
    }
    return response.json();
  },

  // Exportar datos de una encuesta
  async exportSurveyData(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/export`);
    if (!response.ok) {
      throw new Error("Error al exportar los datos");
    }
    return response.json();
  },
};
