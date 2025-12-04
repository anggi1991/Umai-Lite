// Supabase Edge Function: proactive-suggestions
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const body = await req.json();
    const { child_id } = body;

    if (!child_id) {
      return new Response(JSON.stringify({ error: 'child_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch child profile
    const childRes = await fetch(
      `${supabaseUrl}/rest/v1/children?id=eq.${child_id}&select=*`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );
    const children = await childRes.json();
    const child = children[0];

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Calculate age
    const birthDate = new Date(child.birth_date);
    const ageInMonths = Math.floor(
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    // Generate suggestions
    const suggestions = [];
    if (ageInMonths >= 6 && ageInMonths < 7) {
      suggestions.push({
        category: 'milestone',
        priority: 'high',
        title: 'Siap MPASI!',
        description: 'Usia 6 bulan adalah waktu ideal untuk mulai MPASI.',
        icon: '🥄',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        child_name: child.name,
        age_months: ageInMonths,
        suggestions,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
