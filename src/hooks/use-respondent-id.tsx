"use client"

import { useEffect, useState } from "react"

/**
 * Hook para generar y recuperar un identificador único del respondiente
 * basado en características del navegador (fingerprinting básico)
 */
export function useRespondentId(): string {
  const [respondentId, setRespondentId] = useState<string>("")

  useEffect(() => {
    const getOrCreateRespondentId = () => {
      const storageKey = "survey_respondent_id"
      let id = localStorage.getItem(storageKey)

      if (!id) {
        // Generar ID único basado en características del navegador
        const browserData = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timestamp: new Date().getTime(),
          random: Math.random(),
        }

        // Crear hash del navegador
        const hash = btoa(JSON.stringify(browserData))
          .replace(/[^a-z0-9]/gi, "")
          .substring(0, 32)

        id = `respondent_${hash}`
        localStorage.setItem(storageKey, id)
      }

      return id
    }

    setRespondentId(getOrCreateRespondentId())
  }, [])

  return respondentId
}
