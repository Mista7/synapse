import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a concept extraction engine. When given document text, extract the key concepts and their relationships. Return ONLY a JSON object in this exact format:

{
  "nodes": [
    { "id": "1", "label": "Concept Name", "summary": "One sentence explanation", "source": "exact quote or passage from the document this came from" }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "relationship description" }
  ]
}

Rules:
- Extract 8-15 concepts maximum
- Keep labels short (1-4 words)
- Summaries must be one sentence
- Source must be a direct excerpt from the document
- Edges should describe how concepts relate (e.g. "is a type of", "depends on", "causes")
- Return nothing else. No preamble, no markdown, no explanation. Pure JSON only.`;

app.post('/api/extract', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Document text is too short or missing.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nDocument text:\n${text}` }] }],
    });

    const raw = result.response.text().trim();

    // Strip any accidental markdown fences
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const graph = JSON.parse(jsonStr);

    res.json(graph);
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Failed to extract concepts. ' + err.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Synapse server running on http://localhost:${PORT}`));
