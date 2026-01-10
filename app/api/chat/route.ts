import Groq from "groq-sdk";
import { BENEFICIOS_DOCS } from "@/lib/documents";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const systemPrompt = `Eres un asistente legal laboral especializado en derechos de papás profesionales en Chile.

Tu rol es:
1. Responder preguntas sobre beneficios laborales, permisos parentales, y derechos
2. Usar información ACTUAL y VERIFICADA sobre leyes chilenas
3. Ser claro y NO usar jerga legal compleja
4. Dar respuestas prácticas y accionables
5. Siempre mencionar si algo requiere verificación con Inspección del Trabajo

DOCUMENTOS DE REFERENCIA:
${BENEFICIOS_DOCS}

INSTRUCCIONES IMPORTANTES:
- Si el usuario pregunta algo fuera de beneficios laborales de papás, redirige gentilmente
- Si la respuesta requiere asesoría legal profesional, indícalo claramente
- Siempre sé empático con la situación del usuario
- Dale pasos concretos si es posible
- Usa emojis ocasionales para ser amigable
- Estructura respuestas con puntos clave (✅, ⚠️, 📋)

Lenguaje: Amigable, directo, sin términos legales innecesarios.`;

    // Call to Groq API
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content =
      response.choices[0]?.message?.content || "Disculpa, por el momento no cuento con esa información";

    return Response.json({ content });
  } catch (error: any) {
    console.error("Groq API Error:", error);

    return Response.json(
      {
        error: error.message || "Error procesando tu pregunta",
      },
      { status: 500 }
    );
  }
}
