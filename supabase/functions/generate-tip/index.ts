// Supabase Edge Function: generate-tip
// Deno environment
// Usage: supabase functions deploy generate-tip
// Expects env vars: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT

// Note: VS Code may show "Cannot find module" error for Deno URL imports.
// This is a TypeScript editor limitation - the code runs fine in Deno runtime.
// See deno.json for Deno-specific configuration.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// Minimal Deno declaration for TypeScript linting in editor (Supabase Edge runtime provides actual Deno global)
// This avoids compile-time "Cannot find name 'Deno'" errors when using standard TS tooling.
declare const Deno: any;

// ===== Types =====
interface GenerateBody {
  child_id?: string;
  context?: string; // optional extra context supplied by client
  ai_persona?: string; // friendly, professional, encouraging, concise
  language?: string; // 'id', 'en', 'zh', 'jp'
}

interface OpenAIChatRequest {
  messages: { role: string; content: string }[];
  temperature?: number;
  max_completion_tokens?: number;
}

interface PersonalizationData {
  age_months?: number;
  age_days?: number;
  recent_activities?: { id?: string; type?: string; notes?: string; created_at?: string }[];
  child_name?: string;
}

// ===== Safety & Constants =====
const unsafeKeywords = [
  'diagnosa',
  'diagnosis',
  'obat resep',
  'resep dokter',
  'darurat medis',
  'kejang',
  'sesak parah',
  'patah tulang',
];

function containsUnsafe(text: string): boolean {
  const lower = text.toLowerCase();
  return unsafeKeywords.some((k) => lower.includes(k));
}

// ===== System Prompts per Language =====
const systemPrompts: Record<string, string> = {
  id: 'Anda adalah asisten parenting empatik berbahasa Indonesia. Berikan jawaban ringkas (maks 2 paragraf), non-medis, hindari diagnosis dan anjurkan konsultasi tenaga kesehatan bila perlu.',
  en: 'You are an empathetic parenting assistant. Provide concise answers (max 2 paragraphs), non-medical, avoid diagnosis, and recommend professional consultation if necessary.',
  zh: '您是一位富有同情心的育儿助手。请提供简明扼要的回答（最多2段），非医疗性质，避免诊断，并在必要时建议咨询专业医护人员。',
  jp: 'あなたは共感的な育児アシスタントです。簡潔な回答（最大2段落）を提供し、医療的アドバイスや診断を避け、必要に応じて専門家への相談を勧めてください。',
};

// ===== AI Persona Instructions =====
const personaInstructions = {
  friendly: {
    id: "\n\n🤗 GAYA KOMUNIKASI: Ramah dan Hangat\n- Gunakan bahasa akrab dan bersahabat\n- Sertakan emoji yang relevan\n- Tunjukkan empati tinggi\n- Gunakan kata 'kamu' dan 'anak kamu'\n- Berikan dukungan emosional",
    en: "\n\n🤗 COMMUNICATION STYLE: Friendly and Warm\n- Use familiar and friendly language\n- Include relevant emojis\n- Show high empathy\n- Use 'you' and 'your child'\n- Provide emotional support",
    zh: '\n\n🤗 沟通风格：友好温暖\n- 使用亲切友好的语言\n- 包含相关的表情符号\n- 表现出高度的同理心\n- 使用“你”和“你的孩子”\n- 提供情感支持',
    jp: '\n\n🤗 コミュニケーションスタイル：フレンドリーで温かい\n- 親しみやすい言葉遣いを使用\n- 関連する絵文字を含める\n- 高い共感を示す\n- 「あなた」と「あなたの子」を使用\n- 感情的なサポートを提供する',
  },
  professional: {
    id: '\n\n👔 GAYA KOMUNIKASI: Profesional dan Informatif\n- Bahasa formal namun tetap hangat\n- Hindari emoji berlebihan (maks 1-2)\n- Fokus pada fakta dan data\n- Gunakan istilah yang tepat\n- Berikan referensi jika perlu',
    en: '\n\n👔 COMMUNICATION STYLE: Professional and Informative\n- Formal yet warm language\n- Avoid excessive emojis (max 1-2)\n- Focus on facts and data\n- Use precise terms\n- Provide references if needed',
    zh: '\n\n👔 沟通风格：专业且信息丰富\n- 正式但温暖的语言\n- 避免过多的表情符号（最多1-2个）\n- 专注于事实和数据\n- 使用精确的术语\n- 如有需要提供参考',
    jp: '\n\n👔 コミュニケーションスタイル：プロフェッショナルで有益\n- フォーマルだが温かい言葉遣い\n- 過度な絵文字を避ける（最大1-2個）\n- 事実とデータに焦点を当てる\n- 正確な用語を使用\n- 必要に応じて参照を提供する',
  },
  encouraging: {
    id: '\n\n💪 GAYA KOMUNIKASI: Mendorong dan Positif\n- Berikan pujian dan apresiasi\n- Gunakan bahasa positif\n- Motivasi dan dorong action\n- Tekankan kemampuan orang tua\n- Rayakan progress kecil',
    en: '\n\n💪 COMMUNICATION STYLE: Encouraging and Positive\n- Give praise and appreciation\n- Use positive language\n- Motivate and encourage action\n- Emphasize parental capabilities\n- Celebrate small progress',
    zh: '\n\n💪 沟通风格：鼓励和积极\n- 给予赞扬和欣赏\n- 使用积极的语言\n- 激励和鼓励行动\n- 强调父母的能力\n- 庆祝小进步',
    jp: '\n\n💪 コミュニケーションスタイル：励ましとポジティブ\n- 称賛と感謝を与える\n- ポジティブな言葉を使用\n- 行動を動機付け、奨励する\n- 親の能力を強調する\n- 小さな進歩を祝う',
  },
  concise: {
    id: '\n\n📝 GAYA KOMUNIKASI: Ringkas dan To-the-Point\n- Jawaban singkat dan padat\n- Gunakan bullet points\n- Langsung ke inti\n- Hindari penjelasan panjang\n- Maksimal 3-4 poin',
    en: '\n\n📝 COMMUNICATION STYLE: Concise and To-the-Point\n- Short and dense answers\n- Use bullet points\n- Straight to the point\n- Avoid long explanations\n- Max 3-4 points',
    zh: '\n\n📝 沟通风格：简洁明了\n- 简短而密集的回答\n- 使用要点\n- 直奔主题\n- 避免长篇大论\n- 最多3-4点',
    jp: '\n\n📝 コミュニケーションスタイル：簡潔で要点を得ている\n- 短く密度の高い回答\n- 箇条書きを使用\n- 要点に直行\n- 長い説明を避ける\n- 最大3-4ポイント',
  },
};

// ===== External Model Call (with simulation mode) =====
async function callAzureOpenAI(prompt: string, language: string = 'id'): Promise<string> {
  // Simulation mode for local testing without credentials
  if (Deno.env.get('SIMULATE_OPENAI') === '1') {
    // Return safe simulated tip without echoing prompt (which may contain system instructions with unsafe words)
    const simulatedTips: Record<string, string> = {
      id: `Berikut beberapa tips parenting:\n1) Luangkan waktu berkualitas dengan anak setiap hari meski singkat.\n2) Amati pola dan rutinitas harian anak, lalu responsif terhadap kebutuhannya.\n3) Ciptakan lingkungan yang aman dan mendukung eksplorasi positif.\n\n(Simulated response - prompt processed safely)`,
      en: `Here are some parenting tips:\n1) Spend quality time with your child every day, even if brief.\n2) Observe your child's daily patterns and routines, then be responsive to their needs.\n3) Create a safe environment that supports positive exploration.\n\n(Simulated response - prompt processed safely)`,
      zh: `这里有一些育儿技巧：\n1) 即使时间很短，每天也要和孩子共度高质量的时光。\n2) 观察孩子的日常模式和规律，然后对他们的需求做出反应。\n3) 创造一个安全的环境，支持积极的探索。\n\n(Simulated response - prompt processed safely)`,
      jp: `育児のヒントをいくつか紹介します：\n1) 短くても、毎日子供と質の高い時間を過ごしましょう。\n2) 子供の日常のパターンやルーチンを観察し、ニーズに応えましょう。\n3) 前向きな探求をサポートする安全な環境を作りましょう。\n\n(Simulated response - prompt processed safely)`,
    };
    return simulatedTips[language] || simulatedTips['id'];
  }

  const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
  const key = Deno.env.get('AZURE_OPENAI_KEY');
  const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');
  if (!endpoint || !key || !deployment) {
    throw new Error('Missing Azure OpenAI environment configuration');
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  const systemContent = systemPrompts[language] || systemPrompts['id'];

  const body: OpenAIChatRequest = {
    messages: [
      {
        role: 'system',
        content: systemContent,
      },
      { role: 'user', content: prompt },
    ],
    // temperature: 0.7, // GPT-5-mini only supports default temperature (1)
    max_completion_tokens: 1500, // GPT-5-mini needs more tokens for reasoning + output
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': key,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Azure OpenAI error: ${resp.status} ${errText}`);
  }

  const json = await resp.json();
  const first = json.choices?.[0]?.message?.content?.trim();
  if (!first) throw new Error('No content returned from model');
  return first;
}

// ===== Utility: JWT decode =====
async function extractUserId(authHeader: string): Promise<string | null> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const payloadSeg = token.split('.')[1];
    const json = JSON.parse(atob(payloadSeg));
    return json.sub || null;
  } catch {
    return null;
  }
}

// ===== Fetch personalization data from Supabase (child + recent activities) =====
async function fetchPersonalization(childId: string, userId: string): Promise<PersonalizationData> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    // Missing config -> return empty personalization
    return {};
  }

  try {
    // Add timeout to fetch requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Fetch child with timeout
    const childResp = await fetch(
      `${supabaseUrl}/rest/v1/children?id=eq.${childId}&user_id=eq.${userId}&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);
    const childJson = childResp.ok ? await childResp.json() : [];
    const child = Array.isArray(childJson) ? childJson[0] : null;

    // Fetch recent activities (last 5)
    const actResp = await fetch(
      `${supabaseUrl}/rest/v1/activities?child_id=eq.${childId}&user_id=eq.${userId}&order=created_at.desc&limit=5`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );
    const actsJson = actResp.ok ? await actResp.json() : [];
    const recentActs = Array.isArray(actsJson) ? actsJson : [];

    let age_months: number | undefined;
    let age_days: number | undefined;
    let child_name: string | undefined;
    if (child?.dob) {
      const dob = new Date(child.dob);
      const now = new Date();
      const diffMs = now.getTime() - dob.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      age_days = diffDays;
      age_months = Math.floor(diffDays / 30.4375); // approximate month length
    }
    if (child?.full_name) child_name = child.full_name;

    return {
      age_months,
      age_days,
      child_name,
      recent_activities: recentActs.map((a: any) => ({
        id: a.id,
        type: a.type,
        notes: a.notes,
        created_at: a.created_at,
      })),
    };
  } catch (e) {
    console.error('fetchPersonalization error', e);
    return {};
  }
}

// ===== Prompt Composer =====
function composePrompt(
  extraContext: string,
  personalization: PersonalizationData,
  aiPersona: string = 'friendly',
  language: string = 'id',
): { prompt: string; personalizationText: string } {
  const lines: string[] = [];

  // Localized labels
  const labels: Record<string, any> = {
    id: {
      name: 'Nama anak',
      age: 'Usia',
      months: 'bulan',
      days: 'hari',
      activities: 'Aktivitas terbaru',
      notAvailable: '(tidak tersedia)',
      context: 'Konteks tambahan',
    },
    en: {
      name: 'Child name',
      age: 'Age',
      months: 'months',
      days: 'days',
      activities: 'Recent activities',
      notAvailable: '(not available)',
      context: 'Additional context',
    },
    zh: {
      name: '孩子姓名',
      age: '年龄',
      months: '个月',
      days: '天',
      activities: '最近活动',
      notAvailable: '(不可用)',
      context: '额外背景',
    },
    jp: {
      name: '子供の名前',
      age: '年齢',
      months: 'ヶ月',
      days: '日',
      activities: '最近の活動',
      notAvailable: '(利用不可)',
      context: '追加のコンテキスト',
    },
  };

  const l = labels[language] || labels['id'];

  if (personalization.child_name) {
    lines.push(`${l.name}: ${personalization.child_name}`);
  }
  if (personalization.age_months !== undefined) {
    lines.push(
      `${l.age}: ${personalization.age_months} ${l.months} (±${personalization.age_days} ${l.days})`,
    );
  }
  if (personalization.recent_activities && personalization.recent_activities.length) {
    const actsStr = personalization.recent_activities
      .map((a) => `${a.type}${a.notes ? `(${a.notes.slice(0, 30)})` : ''}`)
      .join(', ');
    lines.push(`${l.activities}: ${actsStr}`);
  } else {
    lines.push(`${l.activities}: ${l.notAvailable}`);
  }
  if (extraContext) {
    lines.push(`${l.context}: ${extraContext}`);
  }
  const personalizationText = lines.join('\n');

  // Apply AI persona with localized instructions
  const personaKey = aiPersona as keyof typeof personaInstructions;
  const personaObj = personaInstructions[personaKey] || personaInstructions.friendly;
  const personaModifier = (personaObj as any)[language] || (personaObj as any)['id'];

  // Localized base prompts
  const basePrompts: Record<string, string> = {
    id: `Berikan 1-2 tips parenting harian yang personal dan empatik berdasarkan profil berikut. Hindari konten medis atau diagnosis. Jika ada kekhawatiran medis, sarankan konsultasi profesional.\n\n${personalizationText}${personaModifier}`,
    en: `Provide 1-2 personalized and empathetic daily parenting tips based on the following profile. Avoid medical content or diagnosis. If there are medical concerns, recommend professional consultation.\n\n${personalizationText}${personaModifier}`,
    zh: `根据以下资料，提供1-2条个性化且富有同情心的每日育儿建议。避免医疗内容或诊断。如果有医疗疑虑，建议咨询专业人士。\n\n${personalizationText}${personaModifier}`,
    jp: `以下のプロフィールに基づいて、パーソナライズされた共感的な毎日の育児ヒントを1〜2つ提供してください。医療的な内容や診断は避けてください。医療的な懸念がある場合は、専門家への相談を勧めてください。\n\n${personalizationText}${personaModifier}`,
  };

  const basePrompt = basePrompts[language] || basePrompts['id'];

  return { prompt: basePrompt, personalizationText };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ===== Learning & Analytics Functions =====
async function trackAnalytics(
  userId: string | null,
  eventType: string,
  eventCategory: string,
  metadata: Record<string, any> = {},
): Promise<void> {
  if (!userId) return;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    await fetch(`${supabaseUrl}/rest/v1/usage_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        event_type: eventType,
        event_category: eventCategory,
        metadata,
      }),
    });
    console.log('📊 Analytics tracked:', eventType);
  } catch (err) {
    console.error('❌ Analytics error:', err);
  }
}

async function saveLearningData(
  userId: string | null,
  childId: string | null,
  context: string,
  tipGenerated: string,
  aiPersona: string,
): Promise<void> {
  if (!userId) return;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    const topic = detectTopic(context || tipGenerated);
    const insights = extractInsights(tipGenerated);
    const preference = {
      persona: aiPersona,
      feature: 'daily_tip',
      response_length: tipGenerated.length > 500 ? 'detailed' : 'concise',
    };
    await fetch(`${supabaseUrl}/rest/v1/assistant_learnings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        child_id: childId,
        conversation_topic: topic,
        user_preference: preference,
        key_insights: insights,
      }),
    });
    console.log('📚 Learning saved:', topic);
  } catch (err) {
    console.error('❌ Learning error:', err);
  }
}

function detectTopic(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('makan') ||
    lower.includes('asi') ||
    lower.includes('mpasi') ||
    lower.includes('feeding') ||
    lower.includes('food')
  )
    return 'feeding_nutrition';
  if (lower.includes('tidur') || lower.includes('susah tidur') || lower.includes('sleep'))
    return 'sleep';
  if (
    lower.includes('tumbuh kembang') ||
    lower.includes('milestone') ||
    lower.includes('development')
  )
    return 'development';
  if (
    lower.includes('rewel') ||
    lower.includes('menangis') ||
    lower.includes('cry') ||
    lower.includes('fussy')
  )
    return 'behavior_emotion';
  if (
    lower.includes('sakit') ||
    lower.includes('demam') ||
    lower.includes('sick') ||
    lower.includes('fever')
  )
    return 'health';
  if (
    lower.includes('bermain') ||
    lower.includes('mainan') ||
    lower.includes('play') ||
    lower.includes('toy')
  )
    return 'play_activity';
  if (
    lower.includes('berat') ||
    lower.includes('tinggi') ||
    lower.includes('weight') ||
    lower.includes('height')
  )
    return 'growth';
  return 'general_parenting';
}

function extractInsights(response: string): string[] {
  const insights: string[] = [];
  const lines = response.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d\)\-•]/)) {
      const insight = trimmed.replace(/^[\d\)\-•]\s*/, '').trim();
      if (insight.length > 10) insights.push(insight);
    }
  }
  if (insights.length === 0) {
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    insights.push(...sentences.slice(0, 3).map((s) => s.trim()));
  }
  return insights.slice(0, 5);
}

// ===== Handler (exported for testing) =====
export async function generateTipHandler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body: GenerateBody = await req.json();
    const childId = body.child_id || null;
    const extraContext = body.context || '';
    const aiPersona = body.ai_persona || 'friendly';
    const language = body.language || 'id'; // Default to Indonesian if not specified

    console.log('🎨 AI Persona:', aiPersona);
    console.log('🌐 Language:', language);

    const userId = await extractUserId(authHeader);
    let personalization: PersonalizationData = {};
    if (childId && userId) {
      personalization = await fetchPersonalization(childId, userId);
    }

    // Compose enriched prompt with AI persona and language
    const { prompt, personalizationText } = composePrompt(
      extraContext,
      personalization,
      aiPersona,
      language,
    );

    let tip: string;
    try {
      tip = await callAzureOpenAI(prompt, language);
    } catch (e) {
      console.error('Model call failed', e);
      return new Response(JSON.stringify({ error: 'Model call failed' }), { status: 500 });
    }

    if (containsUnsafe(tip)) {
      const unsafeMsg: Record<string, string> = {
        id: 'Mohon konsultasikan topik ini dengan tenaga kesehatan profesional. Hindari menangani kasus medis serius tanpa bantuan dokter.',
        en: "Please consult this topic with a professional healthcare provider. Avoid handling serious medical cases without a doctor's help.",
        zh: '请咨询专业医护人员。避免在没有医生帮助的情况下处理严重的医疗病例。',
        jp: 'このトピックについては、専門の医療提供者に相談してください。医師の助けなしに深刻な医療ケースを扱わないでください。',
      };
      tip = unsafeMsg[language] || unsafeMsg['id'];
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      // If missing config, just return the generated tip without persistence (useful for local simulation)
      return new Response(
        JSON.stringify({
          tip_text: tip,
          simulated: true,
          prompt: { base: prompt, personalization, context: extraContext },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }

    const insertResp = await fetch(`${supabaseUrl}/rest/v1/daily_tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId || undefined,
        child_id: childId,
        tip_text: tip,
        model:
          Deno.env.get('AZURE_OPENAI_DEPLOYMENT') ||
          (Deno.env.get('SIMULATE_OPENAI') ? 'simulated' : 'azure-gpt'),
        prompt: { base: prompt, context: extraContext, personalization, language },
        // Removed personalization_text field as it doesn't exist in schema
      }),
    });

    if (!insertResp.ok) {
      const err = await insertResp.text();
      console.error('Insert daily_tips failed', err);
      return new Response(JSON.stringify({ error: 'Insert failed' }), { status: 500 });
    }
    const insertedJson = await insertResp.json();
    const inserted = Array.isArray(insertedJson) ? insertedJson[0] : insertedJson;

    // Track learning & analytics in background (non-blocking)
    saveLearningData(userId, childId, extraContext, tip, aiPersona).catch((err) =>
      console.error('⚠️ Learning failed:', err),
    );
    trackAnalytics(userId, 'daily_tip_generated', 'ai_tips', {
      persona: aiPersona,
      topic: detectTopic(extraContext || tip),
      child_id: childId,
      language,
    }).catch((err) => console.error('⚠️ Analytics failed:', err));

    return new Response(JSON.stringify(inserted), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error('Unhandled error generate-tip', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// ===== Server Entrypoint =====
// Only start server if running as main module (not imported for testing)
if ((import.meta as any).main) {
  serve(generateTipHandler);
}
