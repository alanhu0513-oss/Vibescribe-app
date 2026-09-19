import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSmartFallbackTags(content: string, platform?: string): string[] {
  const text = (content || '').toLowerCase();
  const tags: Set<string> = new Set();

  if (text.includes('ai') || text.includes('gpt') || text.includes('model') || text.includes('gemini')) {
    tags.add('#ArtificialIntelligence');
    tags.add('#MachineLearning');
    tags.add('#GenerativeAI');
  }
  if (text.includes('saas') || text.includes('product') || text.includes('launch') || text.includes('startup')) {
    tags.add('#SaaS');
    tags.add('#BuildInPublic');
    tags.add('#ProductLedGrowth');
  }
  if (text.includes('code') || text.includes('engineer') || text.includes('dev') || text.includes('software') || text.includes('system')) {
    tags.add('#SoftwareEngineering');
    tags.add('#DevCommunity');
    tags.add('#TechArchitecture');
  }
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('minimal')) {
    tags.add('#UIDesign');
    tags.add('#DesignSystems');
  }
  if (text.includes('market') || text.includes('growth') || text.includes('lead') || text.includes('scale')) {
    tags.add('#GrowthStrategy');
    tags.add('#TechLeadership');
  }

  // Platform-specific defaults if set is small
  if (platform === 'linkedin') {
    tags.add('#Leadership');
    tags.add('#Innovation');
    tags.add('#FutureOfWork');
  } else if (platform === 'twitter') {
    tags.add('#TechTwitter');
    tags.add('#IndieHacker');
    tags.add('#100DaysOfCode');
  } else if (platform === 'instagram') {
    tags.add('#TechLifestyle');
    tags.add('#DeveloperVibes');
    tags.add('#CodingCommunity');
  } else {
    tags.add('#TechInsights');
    tags.add('#FounderLife');
  }

  return Array.from(tags).slice(0, 8);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy GoogleGenAI client
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
  }

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // AI-powered Trending Hashtag generator
  app.post('/api/generate-hashtags', async (req, res) => {
    try {
      const { content, platform } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Post content string is required' });
      }

      const ai = getAI();
      if (!ai) {
        const fallbackTags = getSmartFallbackTags(content, platform);
        return res.json({ hashtags: fallbackTags, source: 'heuristics' });
      }

      const prompt = `You are a social media algorithm specialist and virality strategist. Given the post snippet below and the target platform (${platform || 'general'}), generate a list of 6-8 ultra-targeted, currently trending, high-conversion hashtags.

Platform: ${platform || 'general'}
Post Snippet:
"""
${content.slice(0, 1000)}
"""

Instructions:
- Return ONLY a JSON array of hashtag strings (each starting with '#')
- Max 8 hashtags
- Select tags proven to drive genuine impressions and reach on ${platform || 'social networks'}
- Do NOT wrap in markdown fences or quotes outside the JSON
Example format: ["#TechLeadership", "#SoftwareEngineering", "#Architecture", "#SaaS", "#DevOps"]
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const raw = response.text?.trim() || '[]';
      let tags: string[] = [];
      try {
        tags = JSON.parse(raw);
      } catch {
        const matches = raw.match(/#[A-Za-z0-9_]+/g);
        tags = matches || [];
      }

      if (!Array.isArray(tags) || tags.length === 0) {
        tags = getSmartFallbackTags(content, platform);
      } else {
        // ensure each has '#'
        tags = tags.map(t => t.startsWith('#') ? t : `#${t}`).filter(t => t.length > 2);
      }

      return res.json({ hashtags: tags, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini API hashtag error, using heuristic fallback:', err?.message || err);
      const fallbackTags = getSmartFallbackTags(req.body?.content || '', req.body?.platform);
      return res.json({ hashtags: fallbackTags, source: 'heuristics-fallback' });
    }
  });

  // Vite dev or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeScribe OS full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
