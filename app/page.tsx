"use client"

import { useChat } from "@ai-sdk/react"
import { ArrowUp, Sun, Moon, User, Bot } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

const universitySuggestions = [
  "¿Qué materias debo aprobar para cursar Comunicación de Datos?",
  "¿En qué cuatrimestre se cursa Bases de Datos?",
  "¿Cuáles son las correlativas de Análisis Matemático II?",
  "¿Cuáles son las materias de primer año de Ingeniería en Sistemas?",
  "¿Qué materias electivas puedo elegir en cuarto año?",
  "¿Donde puedo calcular las horas de electivas que poseo?",
]

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as any)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header minimalista */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href="https://www.frre.utn.edu.ar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image 
                src="https://www.universidadesargentinas.com.ar/images/universities/logos/utn.png" 
                alt="UTN Logo" 
                width={40}
                height={40}
                className="object-contain"
              />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">ISIdoro</h1>
              <h2 className="text-sm text-muted-foreground">Departamento de Ingeniería en Sistemas de Información</h2>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-3xl mx-auto px-4 pb-32">
        {messages.length === 0 ? (
          /* Estado inicial */
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-medium">¿En qué puedo ayudarte?</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Pregúntame sobre materias, correlativas y todo lo relacionado con ISI.
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-2">
              {universitySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full p-3 text-left text-sm rounded-lg border hover:bg-accent transition-colors"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Mensajes del chat */
          <div className="py-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Contenido del mensaje */}
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground capitalize">
                    {message.role === "user" ? "Tú" : "Asistente"}
                  </div>

                  <div className="prose prose-sm max-w-none">
                    {message.parts?.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                              {part.text}
                            </div>
                          )
                        case "tool-invocation":
                          const toolInvocation = part.toolInvocation
                          const isComplete = toolInvocation.state === "result"

                          return (
                            <div key={i} className="my-3">
                              {!isComplete ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                                  Buscando información...
                                </div>
                              ) : (
                                <div className="bg-muted/50 rounded-lg p-3 border">
                                  <div className="text-xs font-medium text-muted-foreground mb-2">
                                    📚 Información encontrada
                                  </div>
                                  <div className="text-sm whitespace-pre-wrap">
                                    {'result' in toolInvocation ? toolInvocation.result : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        default:
                          return null
                      }
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Asistente</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                    Pensando...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu pregunta..."
              className="w-full pl-4 pr-12 py-3 rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
