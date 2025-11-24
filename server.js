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
Eres el agente de soporte oficial del sitio INDAUTOR.
Respondes en español, con tono profesional pero amable.
Ayudas a los usuarios a:
- Navegar por el sitio.
- Entender el contenido relacionado con la Plataforma de trámites en línea - INDARELÍN 
- Resolver dudas generales sobre los proyectos o secciones del sitio.
Si el usuario pide algo que requiera datos internos o personales,
indica que debe contactar a soporte humano.
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


