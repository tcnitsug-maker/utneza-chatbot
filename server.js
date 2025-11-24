import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("✅ API del chatbot UTNeza está funcionando.");
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

