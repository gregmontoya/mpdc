const IntensiveInvite = (name) => {
    const firstName = name ? name.split(' ')[0] : 'friend';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a202c; 
            margin: 0; 
            padding: 20px;
            background-color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #B3542D;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 25px 0;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #edf2f7;
            padding-top: 20px;
        }
        .highlight {
            font-weight: bold;
            color: #0b3b36;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Hey ${firstName},</p>
        
        <p>Most men spend months asking the same questions after a divorce:</p>
        
        <ul>
            <li>Why did this happen?</li>
            <li>Why now?</li>
            <li>Why me?</li>
        </ul>
        
        <p>This is the <strong>"Negative Thinking Loop,"</strong> and it keeps you stuck in neutral.</p>
        
        <p>This Friday at 6 PM, I am hosting a 30-minute intensive to show you the <span class="highlight">Pattern Interrupt</span>. It is a simple tool to break the spin and pivot your focus toward clear goals.</p>
        
        <p>
            <span class="highlight">When:</span> Friday, March 6th @ 6 PM (Spain Time)<br>
            <span class="highlight">Where:</span> Inside our Free Skool Community (Check the Calendar Tab for the link)
        </p>

        <p><strong>IMPORTANT:</strong> You must be a member of our free Skool community to attend this workshop. If you haven't joined yet, you can do so for free at the link below.</p>
        
        <p>Stop looking back. Start looking forward. See you there.</p>
        
        <a href="https://www.skool.com/the-post-divorce-advantage-8284/calendar?eid=f1c022f2d4484557a2d1f51fd581f76e" class="button">JOIN THE SKOOL & VIEW EVENT</a>
        
        <p>To your comeback,<br>
        <strong>Alex Morgan</strong><br>
        Founder, Men's Post-Divorce Coaching</p>
        
        <div class="footer">
            <p>Don’t want to be notified of new posts from admins? <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #718096;">Unsubscribe</a></p>
            <p>&copy; 2026 Men's Post-Divorce Coaching. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = IntensiveInvite;
