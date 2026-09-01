export interface Env {
  AI: any;
  PRODUCTS_DATA: string; // داده‌های محصولات از محیط
}

const SYSTEM_PROMPT = `شما یک مشاور فروش هوشمند هستید. 
بر اساس اطلاعات محصولات زیر، به سوالات کاربران پاسخ دهید و محصولات مناسب را پیشنهاد دهید:

[PRODUCTS_DATA]

نکات مهم:
- همیشه با لحنی گرم و دوستانه پاسخ دهید.
- اگر کاربر نیاز مشخصی دارد، دقیقاً محصول مناسب را معرفی کنید.
- برای هر محصول، نام، ویژگی‌ها و قیمت را ذکر کنید.
- لینک محصولات را به صورت Markdown [نام محصول](لینک) ارائه دهید.
- اگر سوال خارج از حیطه محصولات است، مؤدبانه راهنمایی کنید.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // تنظیم CORS
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
      const { messages, systemPrompt } = await request.json() as any;
      
      // ترکیب سیستم پرامپت با داده‌های محصولات
      const finalSystemPrompt = systemPrompt || SYSTEM_PROMPT.replace(
        '[PRODUCTS_DATA]', 
        env.PRODUCTS_DATA || 'هیچ محصولی ثبت نشده است.'
      );

      // ارتباط با Workers AI
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: finalSystemPrompt },
          ...messages
        ],
        stream: false,
      });

      return new Response(JSON.stringify({ response: response.response }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'خطا در پردازش درخواست' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};
