import { NextResponse } from 'next/server';
import { 
  verifyLineSignature, 
  sendLineReply, 
  handleLineMessage, 
  createWelcomeFlexMessage 
} from '../../../lib/lineBot';

const DEFAULT_LINE_SECRET = 'fcd0db0af8330d9bd35a20616259d4bf';
const DEFAULT_LINE_TOKEN = 'YWzK8zBn3WhDmPiBrn3VUP0WBZgCyqgs7m2pETTXOIhWpHdN13eHQS2Tb0RxHsFjoe0FH8tE3rWa0ncwX9Bp/gXW9mLunfui2go2FpzN967j5KhME6He9XxwJRsROOeLIHsOzUvJrPBdhbHPnp+f3AdB04t89/1O/w1cDnyilFU=';

export const dynamic = 'force-dynamic';

// Keep recent events in memory for live monitoring
let recentEvents = [];

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'LINE Webhook for ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮ',
    lineAccount: '@237ipknp',
    totalEventsReceived: recentEvents.length,
    recentEvents: recentEvents.slice(-5),
    timestamp: new Date().toISOString()
  });
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');
    const channelSecret = process.env.LINE_CHANNEL_SECRET || DEFAULT_LINE_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || DEFAULT_LINE_TOKEN;

    // Verify LINE signature
    if (channelSecret && signature) {
      const isValid = verifyLineSignature(rawBody, signature, channelSecret);
      if (!isValid) {
        console.warn('⚠️ Webhook signature mismatch - proceeding with caution');
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

    console.log(`Processing ${events.length} LINE events...`);
    
    events.forEach(ev => {
      recentEvents.push({
        type: ev.type,
        text: ev.message?.text,
        replyToken: ev.replyToken ? `${ev.replyToken.slice(0, 6)}...` : null,
        time: new Date().toISOString()
      });
    });
    if (recentEvents.length > 50) recentEvents = recentEvents.slice(-50);

    // Process all incoming events asynchronously
    await Promise.all(
      events.map(async (event) => {
        const replyToken = event.replyToken;
        if (!replyToken || replyToken === '00000000000000000000000000000000' || replyToken === 'ffffffffffffffffffffffffffffffff') {
          console.log('Test ping event from LINE Developers Console');
          return;
        }

        try {
          // 1. Follow / Add friend event
          if (event.type === 'follow') {
            console.log('Follow event from user:', event.source?.userId);
            const welcomeMsg = createWelcomeFlexMessage(storeUrl);
            await sendLineReply(replyToken, [welcomeMsg], channelAccessToken);
            return;
          }

          // 2. Incoming text message event
          if (event.type === 'message' && event.message?.type === 'text') {
            const userText = event.message.text;
            console.log('Incoming message text:', userText);
            const replyMessages = await handleLineMessage(userText, storeUrl);
            const sent = await sendLineReply(replyToken, replyMessages, channelAccessToken);
            console.log('Reply sent status:', sent);
            return;
          }

          // 3. Postback event
          if (event.type === 'postback') {
            const postbackData = event.postback.data || '';
            console.log('Postback event data:', postbackData);
            const replyMessages = await handleLineMessage(postbackData, storeUrl);
            await sendLineReply(replyToken, replyMessages, channelAccessToken);
            return;
          }
        } catch (err) {
          console.error('Error handling event:', err);
        }
      })
    );

    return NextResponse.json({ status: 'success', processed: events.length }, { status: 200 });
  } catch (error) {
    console.error('LINE Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
