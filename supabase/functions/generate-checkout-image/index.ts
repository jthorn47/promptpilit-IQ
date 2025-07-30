import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not found");
    }

    const prompt = `Create a modern, professional graphic for workplace safety training checkout page. 
    Design elements: Dark slate blue background with vibrant orange and blue accents, 
    minimalist geometric shapes, modern UI elements suggesting training/learning, 
    clean corporate design, workplace safety icons subtly integrated, 
    gradient backgrounds, rounded corners, professional business aesthetic.
    Style: Modern flat design, high contrast, premium corporate look.
    Colors: Dark slate (#1e293b), bright orange (#f97316), electric blue (#3b82f6), white accents.
    Aspect ratio: 16:9 landscape orientation for header banner.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        response_format: "b64_json"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;

    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64Image}`,
        success: true 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});