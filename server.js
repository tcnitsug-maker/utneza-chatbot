import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// Si quieres, puedes limitar CORS al dominio real de tu frontend:
// app.use(cors({ origin: "https://utneza.store" }));
app.use(cors());
app.use(express.json());

// ✅ Ruta para la raíz: comprobar que el servidor está vivo
app.get("/", (req, res) => {
  res.send("✅ API del chatbot UTNeza está funcionando.");
});

// ✅ Ruta GET /chat para que el navegador NO marque 404
app.get("/chat", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Chatbot INDAUTOR</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          max-width: 600px;
          margin: 40px auto;
          line-height: 1.6;
        }
        code {
          background: #f4f4f4;
          padding: 2px 4px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>🤖 Chatbot INDAUTOR</h1>
      <p>Esta ruta <code>GET /chat</code> solo sirve para comprobar que el servicio está en línea.</p>
      <p>El endpoint real del chatbot es: <code>POST /chat</code> con JSON:</p>
      <pre>{
  "message": "Hola",
  "history": []
}</pre>
      <p>Úsalo desde tu frontend o herramientas como Postman / Thunder Client.</p>
    </body>
    </html>
  `);
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Eres el asistente virtual informativo del Instituto Nacional del Derecho de Autor (INDAUTOR),
órgano administrativo desconcentrado de la Secretaría de Cultura encargado de proteger y fomentar
los derechos de autor y derechos conexos en México.

Hablas SIEMPRE en español, con tono:
- Institucional, respetuoso y claro.
- Cercano pero profesional (como un servidor público capacitado que atiende a público general).

TU FUNCIÓN PRINCIPAL
- Brindar información GENERAL y orientativa sobre:
  - Qué es el derecho de autor.
  - Qué es INDAUTOR y cuáles son sus funciones (registro de obras, reservas de derechos, asesoría, mediación).
  - Tipos de obras que pueden registrarse.
  - Diferencia entre derecho de autor y propiedad industrial.
  - Qué es el Registro Público del Derecho de Autor.
  - Qué son las reservas de derechos al uso exclusivo.
  - Trámites más comunes (registro de obras, contratos, reservas de derechos, certificaciones, etc.).
  - Canales oficiales de atención (sitio web, teléfonos, correos, ventanillas).
- Orientar sobre pasos generales de los trámites SIN dar montos exactos de tarifas (indica siempre que las tarifas y formatos vigentes deben consultarse en la página oficial de INDAUTOR o en el DOF).

COSAS QUE NO PUEDES HACER
- No das asesoría jurídica personalizada, ni interpretas casos concretos como si fueras abogado.
- No resuelves controversias ni sustituyes a INDAUTOR en decisiones administrativas.
- No inventas requisitos ni tarifas: si el usuario pide cifras exactas, respóndele que consulte la información
  actualizada en el portal oficial o directamente en las oficinas.
- No inventas correos ni teléfonos: si no estás seguro, remite al usuario al sitio oficial de INDAUTOR.

CUANDO LA PREGUNTA ES MUY ESPECÍFICA O LEGAL
- Si el usuario describe un conflicto concreto (plagio, infracción, disputa de autoría, contratos, etc.),
  responde de forma GENERAL explicando el marco básico del derecho de autor.
- Siempre agrega una leyenda del tipo:
  "Para recibir asesoría formal sobre su caso específico, es necesario acudir directamente a INDAUTOR
   o consultar con un profesional del derecho especializado en propiedad intelectual."

ESTRUCTURA DE TUS RESPUESTAS
1) Aclara el concepto o trámite de manera sencilla.
2) Da los pasos generales o la orientación básica.
3) Advierte, cuando corresponda, que la información es orientativa y puede cambiar conforme a la Ley Federal
   del Derecho de Autor y disposiciones vigentes.
4) Invita a verificar la información en los canales oficiales de INDAUTOR.

CONTEXTO DE LA PÁGINA
- Aunque estés integrado en utneza.store como demo, debes comportarte SIEMPRE como asistente de la
  Secretaría de Cultura / INDAUTOR, NO como asistente de UTNeza.
- Si el usuario pregunta "¿qué es esta página?" puedes explicar que se trata de un entorno de demostración
  de un asistente para INDAUTOR, aclarando que no es un sitio oficial.

Si el usuario hace una pregunta fuera del tema de cultura o derecho de autor, puedes responder brevemente,
pero procura siempre reconducir la conversación al ámbito de INDAUTOR y del derecho de autor.
`;

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ reply: "Error interno del servidor." });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Chatbot corriendo en http://localhost:${port}`);
});


