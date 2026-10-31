const IntensiveReminder12h = (name) => {
    const firstName = name ? name.split(' ')[0] : 'friend';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 20px; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .button { display: inline-block; padding: 14px 28px; background-color: #B3542D; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 25px 0; text-align: center; }
        .header { color: #0b3b36; font-size: 20px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .footer { margin-top: 40px; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; padding-top: 20px; }
        .highlight { color: #B3542D; font-weight: 700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Today is the day</div>
        <p>Hey ${firstName},</p>
        
        <p>This is a quick reminder that we are going live <span class="highlight">12 hours from now</span> for the <strong>Break the Negative Thinking Loop</strong> intensive.</p>
        
        <p>If you're still replaying the "what if" scenarios and historical arguments in your head, today we stop that cycle.</p>
        
        <p>
            <strong>Time:</strong> Today @ 6 PM (Spain Time)<br>
            <strong>Where:</strong> Inside the Skool Calendar
        </p>

        <p>I'll be walking you through the <strong>Pattern Interrupt</strong> protocol. It's the most practical tool in our system for reclaimng your focus when your mind starts to spin.</p>
        
        <a href="https://www.skool.com/the-post-divorce-advantage-8284/calendar?eid=f1c022f2d4484557a2d1f51fd581f76e" class="button">GET THE LINK HERE</a>
        
        <p>See you in there.</p>
        
        <p>— Alex Morgan</p>
        
        <div class="footer">
            <p>You received this because you are an MPDC Insider. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #718096;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = IntensiveReminder12h;
