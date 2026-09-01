export interface Env {
  AI: any;
  PRODUCTS_DATA?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // مدیریت CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      const body = await request.json() as any;
      const messages = body.messages || [];
      const systemPrompt = body.systemPrompt || `شما یک مشاور فروش محصولات توباکو هستید. 
        بر اساس داده‌های محصولات پاسخ دهید:
        ${env.PRODUCTS_DATA || 'هیچ محصولی ثبت نشده است.'}`;

      // پاسخ از Workers AI
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
      });

      return new Response(JSON.stringify({ 
        response: aiResponse.response 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'خطا در پردازش درخواست' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};
