import { NextResponse } from 'next/server';
import { 
  verifyLineSignature, 
  sendLineReply, 
  handleLineMessage, 
  createWelcomeFlexMessage 
} from '../../../lib/lineBot';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'LINE Webhook for ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ',
    lineAccount: '@237ipknp',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    // Verify LINE signature
    if (channelSecret && signature) {
      const isValid = verifyLineSignature(rawBody, signature, channelSecret);
      if (!isValid) {
        console.warn('⚠️ Invalid LINE Webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const events = payload.events || [];
    const storeUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop-wanghai-o7qg.vercel.app';

    // Process all incoming events asynchronously
    await Promise.all(
      events.map(async (event) => {
        const replyToken = event.replyToken;
        if (!replyToken || replyToken === '00000000000000000000000000000000' || replyToken === 'ffffffffffffffffffffffffffffffff') {
          // LINE Developers test webhook dummy token
          console.log('Received test ping from LINE Developers console');
          return;
        }

        try {
          // 1. When a user adds/follows the LINE Official Account
          if (event.type === 'follow') {
            const welcomeMsg = createWelcomeFlexMessage(storeUrl);
            await sendLineReply(replyToken, [welcomeMsg], channelAccessToken);
            return;
          }

          // 2. When a user sends a text message
          if (event.type === 'message' && event.message?.type === 'text') {
            const userText = event.message.text;
            const replyMessages = await handleLineMessage(userText, storeUrl);
            await sendLineReply(replyToken, replyMessages, channelAccessToken);
            return;
          }

          // 3. Postback events (from Flex buttons or quick replies)
          if (event.type === 'postback') {
            const postbackData = event.postback.data || '';
            const replyMessages = await handleLineMessage(postbackData, storeUrl);
            await sendLineReply(replyToken, replyMessages, channelAccessToken);
            return;
          }
        } catch (err) {
          console.error('Error handling single LINE event:', err);
        }
      })
    );

    return NextResponse.json({ status: 'success', processed: events.length }, { status: 200 });
  } catch (error) {
    console.error('LINE Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
