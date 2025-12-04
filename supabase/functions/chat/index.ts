// Supabase Edge Function: chat
// Simplified chat relay with safety filter.
// Env vars: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT

// Note: VS Code may show "Cannot find module" error for Deno URL imports.
// This is a TypeScript editor limitation - the code runs fine in Deno runtime.
// See deno.json for Deno-specific configuration.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// Minimal Deno declaration for TypeScript linting in editor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

interface ChatBody {
  session_id?: string;
  message: string;
  child_id?: string;
}

const forbiddenMedical = ["diagnosa", "mengobati sendiri", "resep obat", "dosis obat", "patah", "infeksi parah", "meningitis", "sepsis", "kejang terus"];

function needsMedicalDisclaimer(text: string): boolean {
  const lower = text.toLowerCase();
  return forbiddenMedical.some(k => lower.includes(k));
}

async function callAzureStreaming(messages: { role: string; content: string }[], onChunk: (text: string) => void): Promise<string> {
  // Check for simulation mode first
  if (Deno.env.get("SIMULATE_OPENAI") === "1") {
    const userMsg = messages.find(m => m.role === 'user')?.content || '';
    const lower = userMsg.toLowerCase();
    
    let response = '';
    // Keyword-based responses
    if (lower.includes('menenangkan') || lower.includes('rewel')) {
      response = '💡 Beberapa cara menenangkan bayi:\n• Gendong dengan lembut dan ayun perlahan\n• Berikan suara "shh" atau white noise\n• Coba teknik skin-to-skin contact\n• Pastikan bayi tidak lapar atau popok basah\n• Ciptakan lingkungan tenang dan redup\n\nSetiap bayi berbeda, coba berbagai cara untuk menemukan yang paling cocok!';
    } else if (lower.includes('makan') || lower.includes('jadwal') || lower.includes('asi') || lower.includes('mpasi')) {
      response = '🍼 Tips pemberian makan bayi:\n• 0-6 bulan: ASI eksklusif, on-demand (8-12x/hari)\n• 6+ bulan: Mulai MPASI bertahap\n• Perhatikan tanda lapar: mengisap tangan, gelisah\n• Jangan paksa makan, ikuti sinyal bayi\n• Konsultasi dokter untuk panduan spesifik sesuai usia\n\nKonsistensi dan kesabaran adalah kunci!';
    } else if (lower.includes('tidur') || lower.includes('susah tidur')) {
      response = '😴 Tips tidur bayi:\n• Ciptakan rutinitas tidur yang konsisten\n• Lingkungan tenang, redup, suhu nyaman (20-22°C)\n• Bedong bayi dengan aman (jika newborn)\n• Letakkan bayi saat mengantuk tapi belum tidur\n• Tidur siang cukup agar tidak overtired\n\nNewborn butuh 14-17 jam/hari. Pola tidur akan lebih teratur seiring usia.';
    } else if (lower.includes('milestone') || lower.includes('perkembangan') || lower.includes('tumbuh kembang')) {
      response = '🎯 Milestone perkembangan bayi:\n• 0-3 bulan: Angkat kepala, tersenyum sosial, mengikuti objek\n• 4-6 bulan: Tengkurap, duduk dengan bantuan, genggam mainan\n• 7-9 bulan: Duduk sendiri, merangkak, babbling\n• 10-12 bulan: Berdiri, melangkah, kata pertama\n\nSetiap bayi berkembang dengan tempo sendiri. Konsultasi dokter jika ada kekhawatiran.';
    } else {
      response = '🤗 Terima kasih sudah bertanya! Parenting adalah perjalanan penuh pembelajaran.\n\nBeberapa tips umum:\n• Percaya pada insting Anda sebagai orang tua\n• Setiap bayi unik, tidak perlu membandingkan\n• Jaga kesehatan mental Anda juga penting\n• Jangan ragu minta bantuan saat perlu\n• Dokumentasikan momen berharga\n\nAda hal spesifik yang ingin ditanyakan? Saya siap membantu!';
    }
    
    // Simulate streaming by sending chunks
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = i === 0 ? words[i] : ' ' + words[i];
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    }
    
    return response;
  }
  
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
  const key = Deno.env.get("AZURE_OPENAI_KEY");
  const deployment = Deno.env.get("AZURE_OPENAI_DEPLOYMENT");
  if (!endpoint || !key || !deployment) {
    // Fallback to simulation if Azure not configured
    console.log('Azure config missing, using simulation mode');
    const userMsg = messages.find(m => m.role === 'user')?.content || '';
    const fallback = `🤗 Terima kasih sudah bertanya tentang: "${userMsg.slice(0, 50)}..."\n\nSaya siap membantu dengan pertanyaan parenting Anda. Sistem sedang dalam mode fallback.`;
    const words = fallback.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = i === 0 ? words[i] : ' ' + words[i];
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return fallback;
  }
  
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;
  // Enable streaming
  const body = { messages, max_completion_tokens: 2000, stream: true };
  const resp = await fetch(url, { 
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json', 
      'api-key': key 
    }, 
    body: JSON.stringify(body) 
  });
  
  if (!resp.ok) {
    const errText = await resp.text().catch(() => 'Unknown error');
    console.error(`Azure API error ${resp.status}:`, errText);
    throw new Error(`Model error ${resp.status}`);
  }
  
  let fullContent = '';
  const reader = resp.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) throw new Error('No response body');
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onChunk(delta);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
  
  if (!fullContent) throw new Error('No content');
  return fullContent;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    const body: ChatBody = await req.json();
    if (!body.message) return new Response(JSON.stringify({ error: 'message required' }), { status: 400, headers: corsHeaders });

    const userId = await extractUserId(authHeader) || 'anonymous';

    const userPrompt = body.message;
    
    // Setup Supabase for data fetching (moved up before child context)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase config missing');
    
    // 🧠 ENHANCEMENT: Fetch child context for personalized responses
    let childContext = '';
    console.log('🔍 DEBUG: child_id received:', body.child_id);
    
    if (body.child_id) {
      try {
        console.log('📥 Fetching child profile for:', body.child_id);
        // Fetch child profile
        const childResp = await fetch(`${supabaseUrl}/rest/v1/children?id=eq.${body.child_id}&select=*`, {
          headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
        });
        const children = await childResp.json();
        console.log('👶 Child data received:', children);
        const child = Array.isArray(children) && children.length > 0 ? children[0] : null;
        
        if (child) {
          // Calculate age using same logic as frontend formatAge function
          let ageStr = 'Belum diisi';
          const dobField = child.dob || child.birth_date; // Support both column names
          if (dobField) {
            const birthDate = new Date(dobField);
            const now = new Date();
            
            // Validate date is not Invalid Date
            if (!isNaN(birthDate.getTime())) {
              // Calculate age in months (same as frontend calculateAgeInMonths)
              const years = now.getFullYear() - birthDate.getFullYear();
              const months = now.getMonth() - birthDate.getMonth();
              const days = now.getDate() - birthDate.getDate();
              
              let totalMonths = years * 12 + months;
              if (days < 0) totalMonths--; // Adjust if birthday hasn't occurred this month
              
              // Format age (same as frontend formatAge)
              if (totalMonths < 1) {
                const totalDays = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                ageStr = `${totalDays} hari`;
              } else if (totalMonths < 12) {
                ageStr = `${totalMonths} bulan`;
              } else {
                const ageYears = Math.floor(totalMonths / 12);
                const ageMonths = totalMonths % 12;
                ageStr = ageMonths === 0 ? `${ageYears} tahun` : `${ageYears} tahun ${ageMonths} bulan`;
              }
              
              console.log(`✅ Age calculated: ${ageStr} from DOB: ${dobField}`);
            } else {
              console.warn(`⚠️ Invalid date format: ${dobField}`);
            }
          } else {
            console.warn('⚠️ No DOB found in child profile');
          }
          
          childContext += `\n\n=== Profil Anak ===\n`;
          childContext += `Nama: ${child.name}\n`;
          childContext += `Usia: ${ageStr}\n`;
          childContext += `Jenis Kelamin: ${child.gender || 'Tidak disebutkan'}\n`;
          if (child.initial_weight_kg) childContext += `Berat Lahir: ${child.initial_weight_kg} kg\n`;
          if (child.initial_height_cm) childContext += `Tinggi Lahir: ${child.initial_height_cm} cm\n`;
          console.log('✅ Child context built with profile data');
          
          // Fetch latest growth measurements
          const growthResp = await fetch(
            `${supabaseUrl}/rest/v1/growth_logs?child_id=eq.${body.child_id}&select=*&order=measurement_date.desc&limit=3`,
            { headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` } }
          );
          const growthLogs = await growthResp.json();
          
          if (Array.isArray(growthLogs) && growthLogs.length > 0) {
            const latest = growthLogs[0];
            childContext += `\n=== Pertumbuhan Terkini ===\n`;
            if (latest.weight) childContext += `Berat: ${latest.weight} kg\n`;
            if (latest.height) childContext += `Tinggi: ${latest.height} cm\n`;
            if (latest.head_circumference) childContext += `Lingkar Kepala: ${latest.head_circumference} cm\n`;
            if (latest.notes) childContext += `Catatan: ${latest.notes}\n`;
          }
          
          // Fetch recent activities (last 7 days) - FIXED: use 'activities' table
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const activitiesResp = await fetch(
            `${supabaseUrl}/rest/v1/activities?child_id=eq.${body.child_id}&created_at.gte.${sevenDaysAgo}&select=type,start_time,value&order=created_at.desc&limit=10`,
            { headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` } }
          );
          const activities = await activitiesResp.json();
          
          if (Array.isArray(activities) && activities.length > 0) {
            childContext += `\n=== Aktivitas 7 Hari Terakhir ===\n`;
            const activitySummary: { [key: string]: number } = {};
            activities.forEach((a: any) => {
              activitySummary[a.type] = (activitySummary[a.type] || 0) + 1;
            });
            Object.entries(activitySummary).forEach(([type, count]) => {
              childContext += `- ${type}: ${count}x\n`;
            });
            console.log('✅ Activities summary added to context');
          }
          
          // Note: Milestones query removed to optimize performance and reduce timeout
          console.log('📊 Child context complete with profile, growth, and activities');
        }
      } catch (e) {
        console.error('Failed to fetch child context:', e);
        // Continue without context if fetch fails
      }
    }
    
    // 🎨 AI Persona Customization
    const aiPersona = body.ai_persona || 'friendly';
    console.log('🎨 AI Persona:', aiPersona);
    
    // Define persona-specific instructions
    const personaInstructions = {
      friendly: "\n\n🤗 GAYA KOMUNIKASI: Ramah dan Hangat\n- Gunakan bahasa yang akrab dan mudah didekati\n- Sertakan emoji yang mendukung (😊, 💕, 🎉)\n- Berikan dukungan emosional dan empati tinggi\n- Seperti berbicara dengan teman dekat yang peduli",
      
      professional: "\n\n👔 GAYA KOMUNIKASI: Profesional dan Formal\n- Gunakan bahasa yang lebih formal dan terstruktur\n- Hindari penggunaan emoji berlebihan\n- Fokus pada fakta, data, dan saran berbasis bukti\n- Seperti konsultasi dengan ahli parenting profesional",
      
      encouraging: "\n\n💪 GAYA KOMUNIKASI: Mendorong dan Memotivasi\n- Berikan pujian untuk usaha orang tua\n- Gunakan bahasa positif dan membangun kepercayaan diri\n- Fokus pada pencapaian dan kemajuan\n- Dorong dengan semangat: \"Hebat!\", \"Kamu bisa!\", \"Tetap semangat!\"",
      
      concise: "\n\n📝 GAYA KOMUNIKASI: Ringkas dan Langsung\n- Jawaban singkat, padat, to-the-point\n- Gunakan bullet points dan numbering\n- Hindari penjelasan panjang lebar\n- Fokus pada actionable steps yang jelas"
    };
    
    const personaModifier = personaInstructions[aiPersona] || personaInstructions.friendly;
    
    // Build enhanced system prompt with child context
    const baseSystemPrompt = `Anda adalah Umai (You + Me + AI), asisten parenting yang empatik dan mendukung dalam aplikasi Umai. Anda membantu orang tua dalam perjalanan parenting mereka dengan memberikan saran yang praktis, empati, dan berdasarkan data anak yang tersedia di aplikasi.${personaModifier}`;
    
    const appFeaturesContext = `\n\n=== ATURAN MUTLAK - WAJIB DIIKUTI ===
🚫 LARANGAN KERAS:
- JANGAN PERNAH tanya "berapa usia anak Anda" jika data profil sudah ada di bawah
- JANGAN tanya informasi yang sudah tersedia di profil anak
- JANGAN berikan jawaban umum jika data spesifik tersedia
- JANGAN jawab pertanyaan di luar konteks parenting atau aplikasi Umai

✅ KEWAJIBAN:
- WAJIB gunakan nama anak dari profil
- WAJIB gunakan usia anak yang sudah dihitung
- WAJIB rujuk data berat/tinggi terkini jika ada
- WAJIB analisa data aktivitas (feeding, sleep) jika tersedia
- WAJIB berikan insight spesifik berdasarkan data anak

🎯 Contoh Respons yang BENAR:
User: "tahap perkembangan anak saya"
AI: "Berdasarkan data [Nama], usia [X tahun Y bulan], berat [Z] kg, berikut perkembangan yang sudah dicapai dan yang akan datang..."

=== Fitur Aplikasi Umai ===
- STATISTIK: Data pertumbuhan, aktivitas harian (feeding, sleep, diaper)
- GROWTH TRACKER: Berat, tinggi, lingkar kepala dengan WHO percentile
- JURNAL: Catatan aktivitas dan mood bayi
- REMINDERS: Pengingat feeding, sleep, immunisasi`;

    
    const safetyPrompt = "\n\n⚠️ PENTING: Hindari memberikan diagnosis medis. Untuk masalah kesehatan serius, selalu arahkan ke dokter atau tenaga kesehatan profesional.";
    
    const systemPrompt = childContext 
      ? `${baseSystemPrompt}${appFeaturesContext}\n\n${childContext}\n\n✅ GUNAKAN DATA DI ATAS untuk menjawab pertanyaan tentang perkembangan anak. 
      
      ATURAN PENGGUNAAN DATA:
      - Jika usia tercantum (contoh: "2 tahun 3 bulan"), WAJIB gunakan untuk memberikan saran spesifik
      - Jika usia "Belum diisi", minta user melengkapi tanggal lahir di profil anak dengan sopan
      - JANGAN tanya informasi yang sudah ada (nama, jenis kelamin, berat/tinggi terkini)
      - SELALU rujuk nama anak dalam jawaban Anda${safetyPrompt}`
      : `${baseSystemPrompt}${appFeaturesContext}${safetyPrompt}\n\n⚠️ Belum ada data profil anak. Jika user bertanya tentang perkembangan anak mereka, minta mereka menambahkan profil anak di aplikasi terlebih dahulu.`;

    // Create or use existing session
    let sessionId = body.session_id;
    if (!sessionId) {
      const newSessionResp = await fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Prefer': 'return=representation' },
        body: JSON.stringify({ user_id: userId, child_id: body.child_id || null, title: userPrompt.slice(0, 40) })
      });
      const sessionJson = await newSessionResp.json();
      sessionId = Array.isArray(sessionJson) ? sessionJson[0].id : sessionJson.id;
    }

    // Insert user message first
    await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
      body: JSON.stringify({ session_id: sessionId, sender: 'user', role: 'user', content: userPrompt })
    });

    // Check if client wants SSE streaming (via Accept header)
    const acceptHeader = req.headers.get('accept') || '';
    const wantsSSE = acceptHeader.includes('text/event-stream');

    if (wantsSSE) {
      // Create Server-Sent Events stream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          // Send session_id first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'session', session_id: sessionId })}\n\n`));
          
          let fullAnswer = '';
        
        try {
          await callAzureStreaming([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ], (chunk: string) => {
            fullAnswer += chunk;
            // Send each chunk as SSE
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
          });
          
          // Add medical disclaimer if needed
          if (needsMedicalDisclaimer(userPrompt) || needsMedicalDisclaimer(fullAnswer)) {
            const disclaimer = "\n\nDislaimer: Untuk masalah medis serius, segera konsultasikan dengan dokter atau fasilitas kesehatan terdekat.";
            fullAnswer += disclaimer;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: disclaimer })}\n\n`));
          }
          
          // Save to database
          const insertAssistant = await fetch(`${supabaseUrl}/rest/v1/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Prefer': 'return=representation' },
            body: JSON.stringify({ session_id: sessionId, sender: 'assistant', role: 'assistant', content: fullAnswer })
          });
          const assistantJson = await insertAssistant.json();
          const assistantMsg = Array.isArray(assistantJson) ? assistantJson[0] : assistantJson;
          
          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', message_id: assistantMsg.id })}\n\n`));
          
          // Log learning & analytics in background (non-blocking)
          saveLearningData(userId, body.child_id, userPrompt, fullAnswer, aiPersona).catch(err => console.error('⚠️ Learning failed:', err));
          trackAnalytics(userId, 'chat_message', 'ai_chat', { persona: aiPersona, topic: detectTopic(userPrompt), child_id: body.child_id }, sessionId).catch(err => console.error('⚠️ Analytics failed:', err));
        } catch (e) {
          console.error('Streaming error:', e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Model failed' })}\n\n`));
        }
        
        controller.close();
      }
    });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders
        }
      });
    }

    // Default: Return JSON response (compatible with Supabase client)
    let fullAnswer = '';
    try {
      console.log('📞 Calling Azure OpenAI...');
      await callAzureStreaming([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], (chunk: string) => {
        fullAnswer += chunk;
      });
      
      console.log('✅ AI response received, length:', fullAnswer.length);
      
      // Verify we got an answer
      if (!fullAnswer || fullAnswer.trim().length === 0) {
        throw new Error('Empty response from AI');
      }
      
      // Add medical disclaimer if needed
      if (needsMedicalDisclaimer(userPrompt) || needsMedicalDisclaimer(fullAnswer)) {
        fullAnswer += "\n\nDislaimer: Untuk masalah medis serius, segera konsultasikan dengan dokter atau fasilitas kesehatan terdekat.";
      }
      
      // Save to database
      const insertAssistant = await fetch(`${supabaseUrl}/rest/v1/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Prefer': 'return=representation' },
        body: JSON.stringify({ session_id: sessionId, sender: 'assistant', role: 'assistant', content: fullAnswer })
      });
      const assistantJson = await insertAssistant.json();
      const assistantMsg = Array.isArray(assistantJson) ? assistantJson[0] : assistantJson;
      
      // Log learning & analytics in background (non-blocking)
      saveLearningData(userId, body.child_id, userPrompt, fullAnswer, aiPersona).catch(err => console.error('⚠️ Learning failed:', err));
      trackAnalytics(userId, 'chat_message', 'ai_chat', { persona: aiPersona, topic: detectTopic(userPrompt), child_id: body.child_id }, sessionId).catch(err => console.error('⚠️ Analytics failed:', err));
      
      // Return JSON response
      return new Response(JSON.stringify({ 
        session_id: sessionId, 
        answer: fullAnswer,
        message_id: assistantMsg.id
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (e) {
      console.error('AI call error:', e);
      throw e;
    }
  } catch (e) {
    console.error('Unhandled chat error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

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

// 📊 USAGE ANALYTICS TRACKING
async function trackAnalytics(
  userId: string | null,
  eventType: string,
  eventCategory: string,
  metadata: Record<string, any> = {},
  sessionId?: string
): Promise<void> {
  if (!userId) return;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    await fetch(`${supabaseUrl}/rest/v1/usage_analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
      body: JSON.stringify({ user_id: userId, event_type: eventType, event_category: eventCategory, metadata, session_id: sessionId || null }),
    });
    console.log('📊 Analytics tracked:', eventType);
  } catch (err) {
    console.error('❌ Analytics error:', err);
  }
}

// 📚 LEARNING DATA LOGGING
async function saveLearningData(
  userId: string | null,
  childId: string | undefined,
  userPrompt: string,
  aiResponse: string,
  aiPersona: string
): Promise<void> {
  if (!userId) return;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    const topic = detectTopic(userPrompt);
    const insights = extractInsights(aiResponse);
    const preference = { persona: aiPersona, topic_interest: topic, response_length: aiResponse.length > 500 ? 'detailed' : 'concise' };
    await fetch(`${supabaseUrl}/rest/v1/assistant_learnings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
      body: JSON.stringify({ user_id: userId, child_id: childId || null, conversation_topic: topic, user_preference: preference, key_insights: insights }),
    });
    console.log('📚 Learning saved:', topic);
  } catch (err) {
    console.error('❌ Learning error:', err);
  }
}

function detectTopic(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('makan') || lower.includes('asi') || lower.includes('mpasi')) return 'feeding_nutrition';
  if (lower.includes('tidur') || lower.includes('susah tidur')) return 'sleep';
  if (lower.includes('tumbuh kembang') || lower.includes('milestone')) return 'development';
  if (lower.includes('rewel') || lower.includes('menangis')) return 'behavior_emotion';
  if (lower.includes('sakit') || lower.includes('demam')) return 'health';
  if (lower.includes('bermain') || lower.includes('mainan')) return 'play_activity';
  if (lower.includes('berat') || lower.includes('tinggi')) return 'growth';
  return 'general_parenting';
}

function extractInsights(response: string): string[] {
  const insights: string[] = [];
  const lines = response.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const insight = trimmed.replace(/^[•\-]\s*/, '').trim();
      if (insight.length > 10) insights.push(insight);
    }
  }
  if (insights.length === 0) {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
    insights.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  return insights.slice(0, 5);
}
