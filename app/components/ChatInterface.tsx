"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! 👋 Soy tu asistente sobre derechos de papás profesionales en Chile.\n\nPuedo ayudarte con preguntas sobre:\n✅ Permisos parentales y paternales\n✅ Fuero laboral\n✅ Sala cuna y beneficios\n✅ Teletrabajo y corresponsabilidad\n✅ Cómo activar tus derechos\n\n¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setError("");
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el servidor");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al procesar tu pregunta");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${err.message}\n\nPor favor, intenta de nuevo.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Beneficios para padres</h1>
          <p className="text-sm text-teal-100 mt-2">
            Tu asesor de derechos laborales para padres en Chile
          </p>
          <p className="text-xs text-teal-200 mt-1">
            Powered by Groq + Llama | 100% Gratuito
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-md lg:max-w-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-teal-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-white px-4 py-3 border border-gray-200 rounded-2xl rounded-tl-sm">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce delay-100" />
                <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce delay-200" />
              </div>
            </Card>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-2xl">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre permisos, sala cuna, derechos..."
              disabled={loading}
              className="flex-1 rounded-full border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
            >
              {loading ? "..." : "Enviar"}
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-3 px-1">
          Tip: Sé específico en tus preguntas. Ej: "Acabo de ser papá, trabajo
          en remoto, ¿qué derechos tengo?"
        </p>
      </div>
    </div>
  );
}
