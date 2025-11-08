"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import type { Survey } from "@/lib/api";

interface PDFPreviewProps {
  survey: Survey;
  onGeneratePDF?: () => void;
}

export function PDFPreview({ survey, onGeneratePDF }: PDFPreviewProps) {
  const themeColors = {
    "#3B82F6": "Azul",
    "#10B981": "Verde",
    "#F59E0B": "Amarillo",
    "#EF4444": "Rojo",
    "#8B5CF6": "Púrpura",
    "#6B7280": "Gris",
  };

  // Obtener todas las preguntas organizadas por sección
  const getAllQuestions = () => {
    const allQuestions: Array<{
      question: any;
      sectionTitle?: string;
      sectionOrder?: number;
    }> = [];

    // Agregar preguntas de secciones
    survey.sections
      .sort((a, b) => a.section_order - b.section_order)
      .forEach((section) => {
        section.questions
          .sort((a, b) => a.question_order - b.question_order)
          .forEach((question) => {
            allQuestions.push({
              question,
              sectionTitle: section.title,
              sectionOrder: section.section_order,
            });
          });
      });

    // Agregar preguntas sin sección
    survey.questions
      .sort((a, b) => a.question_order - b.question_order)
      .forEach((question) => {
        allQuestions.push({ question });
      });

    return allQuestions;
  };

  const allQuestions = getAllQuestions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Vista Previa PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border rounded-lg p-6 bg-white shadow-sm max-h-96 overflow-y-auto"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "small",
          }}
        >
          {/* Header */}
          {survey.header_image_url && (
            <div className="mb-6 text-center">
              <img
                src={survey.header_image_url || "/placeholder.svg"}
                alt="Header"
                className="max-h-24 mx-auto"
              />
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-gray-600">{survey.description}</p>
            )}
          </div>

          {/* Instructions */}
          {survey.instructions && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Instrucciones:</h3>
              <p className="text-sm text-gray-700">{survey.instructions}</p>
            </div>
          )}

          {/* Questions Preview */}
          <div className="space-y-6">
            {survey.sections.length > 0 ? (
              // Mostrar contenido organizado por secciones
              <>
                {survey.sections
                  .sort((a, b) => a.section_order - b.section_order)
                  .slice(0, 2) // Solo mostrar las primeras 2 secciones en la vista previa
                  .map((section, sectionIndex) => (
                    <div key={section.id} className="space-y-4">
                      {/* Section Header */}
                      <div className="border-t-2 pt-4">
                        <h2 className="text-lg font-semibold mb-2">
                          {section.title}
                        </h2>
                        {section.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {section.description}
                          </p>
                        )}
                      </div>

                      {/* Questions in this section */}
                      {section.questions
                        .sort((a, b) => a.question_order - b.question_order)
                        .slice(0, 2) // Solo mostrar las primeras 2 preguntas por sección
                        .map((question, questionIndex) => (
                          <div key={question.id} className="border-b pb-4">
                            <div className="flex items-start gap-2 mb-2">
                                <span className="font-semibold">
                                  {questionIndex + 1}.
                                </span>
                              
                              <div className="flex-1">
                                <p className="font-medium">
                                  {question.question_text}
                                </p>
                                {question.help_text && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {question.help_text}
                                  </p>
                                )}
                              </div>
                            </div>

                            {question.question_image_url && (
                              <img
                                src={
                                  question.question_image_url ||
                                  "/placeholder.svg"
                                }
                                alt="Imagen de pregunta"
                                className="max-h-32 mb-3"
                              />
                            )}

                            {/* Response area simulation */}
                            <div className="ml-6">
                              {question.question_type === "likert" && (
                                <div className="flex gap-4">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <div
                                      key={num}
                                      className="flex items-center gap-1"
                                    >
                                      <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                      <span className="text-sm">{num}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.question_type === "yesno" && (
                                <div className="flex gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                    <span>Sí</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                    <span>No</span>
                                  </div>
                                </div>
                              )}
                              {question.question_type === "numeric" && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">0</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                                  <span className="text-sm">10</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                      {section.questions.length > 2 && (
                        <div className="text-center text-gray-500 text-sm">
                          ... y {section.questions.length - 2} preguntas más en
                          esta sección
                        </div>
                      )}
                    </div>
                  ))}

                {survey.sections.length > 2 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... y {survey.sections.length - 2} secciones más
                  </div>
                )}

                {/* Preguntas sin sección */}
                {survey.questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t-2 pt-4">
                      <h2 className="text-lg font-semibold mb-4">
                        Preguntas Generales
                      </h2>
                    </div>
                    {survey.questions.slice(0, 2).map((question, index) => (
                      <div key={question.id} className="border-b pb-4">
                        <div className="flex items-start gap-2 mb-2">
                            <span className="font-semibold">{index + 1}.</span>
                          
                          <div className="flex-1">
                            <p className="font-medium">
                              {question.question_text}
                            </p>
                            {question.help_text && (
                              <p className="text-sm text-gray-500 mt-1">
                                {question.help_text}
                              </p>
                            )}
                          </div>
                        </div>

                        {question.question_image_url && (
                          <img
                            src={
                              question.question_image_url || "/placeholder.svg"
                            }
                            alt="Imagen de pregunta"
                            className="max-h-32 mb-3"
                          />
                        )}

                        {/* Response area simulation similar to above */}
                        <div className="ml-6">
                          {question.question_type === "likert" && (
                            <div className="flex gap-4">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div
                                  key={num}
                                  className="flex items-center gap-1"
                                >
                                  <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                  <span className="text-sm">{num}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {question.question_type === "yesno" && (
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                <span>Sí</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                <span>No</span>
                              </div>
                            </div>
                          )}
                          {question.question_type === "numeric" && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">0</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                              <span className="text-sm">10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Mostrar preguntas sin secciones (comportamiento anterior)
              allQuestions.slice(0, 3).map(({ question }, index) => (
                <div key={question.id} className="border-b pb-4">
                  <div className="flex items-start gap-2 mb-2">
                      <span className="font-semibold">{index + 1}.</span>
                    
                    <div className="flex-1">
                      <p className="font-medium">
                        {question.question_text}
                      </p>
                      {question.help_text && (
                        <p className="text-sm text-gray-500 mt-1">
                          {question.help_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {question.question_image_url && (
                    <img
                      src={question.question_image_url || "/placeholder.svg"}
                      alt="Imagen de pregunta"
                      className="max-h-32 mb-3"
                    />
                  )}

                  {/* Response area simulation */}
                  <div className="ml-6">
                    {question.question_type === "likert" && (
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="flex items-center gap-1">
                            <div className="w-4 h-4 border border-gray-400 rounded"></div>
                            <span className="text-sm">{num}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.question_type === "yesno" && (
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-gray-400 rounded"></div>
                          <span>Sí</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-gray-400 rounded"></div>
                          <span>No</span>
                        </div>
                      </div>
                    )}
                    {question.question_type === "numeric" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">0</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                        <span className="text-sm">10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {allQuestions.length > 3 && (
              <div className="text-center text-gray-500 text-sm">
                ... y {allQuestions.length - 3} preguntas más
              </div>
            )}
          </div>

          {/* Footer */}
          {survey.footer_text && (
            <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
              {survey.footer_text}
            </div>
          )}
        </div>

        {/* PDF Settings Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Configuración PDF:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Tamaño: {survey.pdf_settings?.page_size || "A4"}</div>
            <div>
              Orientación: Vertical
            </div>
          </div>
        </div>

        {onGeneratePDF && (
          <Button onClick={onGeneratePDF} className="w-full mt-4">
            <Download className="w-4 h-4 mr-2" />
            Generar PDF
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
