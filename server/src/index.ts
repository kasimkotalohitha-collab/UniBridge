import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeComplaintWithGemini } from './gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'UniBridge Secure AI Proxy',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Analyze complaint endpoint
app.post('/api/analyze-complaint', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: 'Both title and description are required.',
      });
    }

    const result = await analyzeComplaintWithGemini(title, description);
    return res.json(result);
  } catch (err: any) {
    console.error('Error analyzing complaint with Gemini:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI complaint analysis.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`[UniBridge AI Proxy] Server running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      '[UniBridge AI Proxy] Warning: GEMINI_API_KEY is not set in server/.env. Configure it to enable Gemini predictions.'
    );
  }
});
