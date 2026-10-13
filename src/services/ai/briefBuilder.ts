import type { CampaignBrief } from '../../types/campaign';
import type { CreativeCategory } from '../../types/creator';

export interface AIBriefGenerationResult {
  brief: CampaignBrief;
  source: 'gemini' | 'deterministic';
  modelName: string;
  explanation: string;
}

/**
 * Intelligent deterministic natural language brief synthesis.
 * Parses user requirements, platform target, duration, and style heuristics.
 */
export function generateDeterministicBrief(prompt: string): CampaignBrief {
  const p = prompt.toLowerCase();

  // 1. Determine Category
  let category: CreativeCategory = 'AI Video Generation';
  if (p.includes('photo') || p.includes('portrait') || p.includes('lookbook') || p.includes('model shoot')) {
    category = 'AI Photography';
  } else if (p.includes('3d') || p.includes('unreal') || p.includes('cgi') || p.includes('blender')) {
    category = '3D Art and Animation';
  } else if (p.includes('product') || p.includes('bottle') || p.includes('packaging') || p.includes('ecommerce')) {
    category = 'Product Visualization';
  } else if (p.includes('avatar') || p.includes('influencer') || p.includes('human') || p.includes('spokesperson')) {
    category = 'AI Avatars';
  } else if (p.includes('graphic') || p.includes('poster') || p.includes('brand identity') || p.includes('logo')) {
    category = 'AI Graphic Design';
  } else if (p.includes('performance ad') || p.includes('marketing') || p.includes('hook') || p.includes('ugc')) {
    category = 'AI Advertising';
  }

  // 2. Determine Visual Style
  let style = 'Cinematic';
  if (p.includes('minimal') || p.includes('clean') || p.includes('simple')) {
    style = 'Minimalist';
  } else if (p.includes('bold') || p.includes('vibrant') || p.includes('high energy') || p.includes('cyberpunk') || p.includes('futuristic')) {
    style = 'Bold';
  } else if (p.includes('playful') || p.includes('fun') || p.includes('quirky') || p.includes('whimsical')) {
    style = 'Playful';
  } else if (p.includes('corporate') || p.includes('enterprise') || p.includes('business')) {
    style = 'Corporate';
  } else if (p.includes('artistic') || p.includes('abstract') || p.includes('surreal')) {
    style = 'Artistic';
  }

  // 3. Determine Aspect Ratio & Duration
  let aspectRatio = '16:9 (Landscape)';
  let duration = '30 seconds';
  if (p.includes('instagram') || p.includes('reels') || p.includes('tiktok') || p.includes('shorts') || p.includes('vertical') || p.includes('9:16')) {
    aspectRatio = '9:16 (Vertical Reels/TikTok)';
  } else if (p.includes('square') || p.includes('1:1') || p.includes('feed')) {
    aspectRatio = '1:1 (Square Feed)';
  }

  if (p.includes('15') || p.includes('15s') || p.includes('15-second')) {
    duration = '15 seconds';
  } else if (p.includes('60') || p.includes('60s') || p.includes('1-minute')) {
    duration = '60 seconds';
  }

  // 4. Determine Skills & Tools
  const skillsMap: Record<CreativeCategory, string[]> = {
    'AI Video Generation': ['Runway Gen-3', 'Cinematic Prompting', 'Visual Effects', 'Sound Design & Foley', 'Topaz Upscaling'],
    'AI Advertising': ['Midjourney v6', 'High-Converting Hooks', 'Typography & Overlays', 'After Effects', 'Ad Scripting'],
    'AI Photography': ['Midjourney Photorealism', 'Studio Lighting Prompting', 'Photoshop Retouching', 'Color Grading'],
    '3D Art and Animation': ['Blender CGI', 'Unreal Engine 5', 'ComfyUI DepthMap', 'Camera Animation'],
    'AI Graphic Design': ['Stable Diffusion XL', 'Vector Layout', 'Brand Identity Systems', 'Typography'],
    'AI Avatars': ['MetaHuman Creation', 'Lip-Sync Animation', 'HeyGen / ElevenLabs', 'Voice Cloning'],
    'Product Visualization': ['Cinema 4D Rendering', 'Octane Lighting', 'Texture Synthesis', 'Commercial Clean Plate'],
    'AI-Assisted Creative Development': ['Multi-Model Pipeline', 'Creative Direction', 'Prompt Architecture', 'Storyboard Gen'],
  };

  const toolsMap: Record<CreativeCategory, string[]> = {
    'AI Video Generation': ['Runway Gen-3', 'Luma Dream Machine', 'After Effects', 'Premiere Pro'],
    'AI Advertising': ['Midjourney v6', 'CapCut Pro', 'After Effects', 'Kling AI'],
    'AI Photography': ['Midjourney v6', 'Adobe Lightroom', 'Magnific AI', 'Photoshop'],
    '3D Art and Animation': ['Unreal Engine 5', 'Blender', 'Cinema 4D', 'ComfyUI'],
    'AI Graphic Design': ['Figma', 'Illustrator', 'Stable Diffusion', 'Midjourney'],
    'AI Avatars': ['MetaHuman', 'HeyGen', 'ElevenLabs', 'Synthesia'],
    'Product Visualization': ['Octane Render', 'Cinema 4D', 'Magnific AI', 'Midjourney'],
    'AI-Assisted Creative Development': ['Claude 3.5 Sonnet', 'GPT-4o', 'Midjourney', 'Runway'],
  };

  // 5. Budget heuristics in ₹ INR
  let budgetMin = 75000;
  let budgetMax = 180000;
  if (category === 'AI Video Generation' || category === '3D Art and Animation') {
    budgetMin = 100000;
    budgetMax = 250000;
  } else if (category === 'AI Photography' || category === 'AI Graphic Design') {
    budgetMin = 45000;
    budgetMax = 110000;
  }

  // 6. Generate Title
  const cleanPrompt = prompt.replace(/[^\w\s-]/gi, '').trim();
  const titleWords = cleanPrompt.split(/\s+/).slice(0, 6).join(' ');
  const title = titleWords.length > 0 ? `${titleWords.charAt(0).toUpperCase() + titleWords.slice(1)} Campaign` : 'AI Commercial Creative Campaign';

  // 7. Structured Description
  const description = `Commissioning a cutting-edge ${category} production. Vision: ${prompt.trim()}. Deliverable requires ${style.toLowerCase()} art direction, seamless temporal consistency, dynamic audio-visual synergy, and broadcast-ready finishing in ${aspectRatio}.`;

  return {
    title,
    description,
    category,
    requiredSkills: skillsMap[category] || [category],
    preferredTools: toolsMap[category] || ['Midjourney', 'Runway'],
    contentType: category.includes('Video') ? 'Video' : category.includes('3D') ? '3D Asset' : 'Stills',
    aspectRatio,
    duration,
    commercialRequirements: 'Full commercial IP transfer with global unrestricted digital advertising and broadcasting buyout rights.',
    budgetMin,
    budgetMax,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferredStyle: style,
    additionalRequirements: `Output format: 4K Master (ProRes 422 HQ / MP4) + raw generative generation prompts and seed seeds. Full clearance for commercial brand usage.`,
    generatedBy: 'deterministic',
  };
}

/**
 * Builds an AI Brief using Gemini if configured, otherwise falls back to deterministic engine.
 */
export async function buildAIBrief(prompt: string): Promise<AIBriefGenerationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    const brief = generateDeterministicBrief(prompt);
    return {
      brief,
      source: 'deterministic',
      modelName: 'Creovate Semantic AI Engine (Deterministic Fallback)',
      explanation: 'Generated via algorithmic semantic extraction of creative format, duration, tools, and budget in Indian Rupees.',
    };
  }

  try {
    const systemInstruction = `You are an elite creative director and AI producer at Creovate AI.
Convert the client's creative request into a structured JSON campaign brief for commercial AI creators.
You must respond with valid JSON only matching this schema:
{
  "title": "string (concise commercial campaign title)",
  "description": "string (detailed creative vision and requirements)",
  "category": "one of: 'AI Video Generation', 'AI Advertising', 'AI Photography', '3D Art and Animation', 'AI Graphic Design', 'AI Avatars', 'Product Visualization', 'AI-Assisted Creative Development'",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "preferredTools": ["tool1", "tool2"],
  "contentType": "string (e.g. 'Video', 'Stills', '3D Asset')",
  "aspectRatio": "string (e.g. '9:16 (Vertical Reels/TikTok)', '16:9 (Landscape)', '1:1 (Square)')",
  "duration": "string (e.g. '30 seconds', '15 seconds')",
  "commercialRequirements": "string (licensing and buyout terms)",
  "budgetMin": number (in Indian Rupees INR, e.g. 80000),
  "budgetMax": number (in Indian Rupees INR, e.g. 200000),
  "deadline": "YYYY-MM-DD (approx 3 weeks in future)",
  "preferredStyle": "one of: 'Cinematic', 'Minimalist', 'Bold', 'Playful', 'Corporate', 'Artistic'",
  "additionalRequirements": "string"
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nClient Request: "${prompt}"` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content in Gemini response');

    const parsed = JSON.parse(rawText) as CampaignBrief;
    parsed.generatedBy = 'gemini';

    return {
      brief: parsed,
      source: 'gemini',
      modelName: 'Gemini 1.5 Flash',
      explanation: 'Generated live via Google Gemini 1.5 Flash creative reasoning model.',
    };
  } catch (error) {
    console.warn('Gemini API call failed, falling back to deterministic engine:', error);
    const fallbackBrief = generateDeterministicBrief(prompt);
    return {
      brief: fallbackBrief,
      source: 'deterministic',
      modelName: 'Creovate Semantic AI Engine (Fallback)',
      explanation: 'Gemini API was unreachable; converted using semantic heuristic engine.',
    };
  }
}
