const BaseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background-color: #0b3b36; padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; display: block; border: 2px solid rgba(255,255,255,0.2); padding: 10px; width: fit-content; margin: 0 auto; }
        .logo span { color: #C4613A; }
        .hero { width: 100%; height: auto; display: block; }
        .content { padding: 40px; }
        .user-info { display: flex; align-items: center; margin-bottom: 25px; }
        .user-avatar { width: 48px; height: 48px; border-radius: 50%; background-color: #0b3b36; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .user-details { line-height: 1.2; }
        .user-name { font-weight: 700; color: #1e293b; display: block; }
        .user-role { font-size: 12px; color: #64748b; }
        h1 { color: #0b3b36; font-size: 28px; font-weight: 800; margin-top: 0; margin-bottom: 20px; line-height: 1.2; }
        p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .question-list { list-style: none; padding: 0; margin: 25px 0; }
        .question-item { background: #f8fafc; border-left: 4px solid #C4613A; padding: 15px; margin-bottom: 10px; font-style: italic; color: #1e293b; font-weight: 600; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .info-row { margin-bottom: 10px; font-size: 15px; color: #1e293b; }
        .info-row strong { color: #0b3b36; min-width: 60px; display: inline-block; }
        .btn-container { text-align: center; margin-top: 35px; }
        .btn { background-color: #C4613A; color: #ffffff !important; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; }
        .footer { padding: 30px; text-align: center; font-size: 12px; color: #64748b; background: #f8fafc; }
        .footer a { color: #64748b; text-decoration: underline; }
        .skool-branding { margin-top: 20px; font-size: 14px; font-weight: 600; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <a href="https://menspostdivorcecoaching.com" class="logo">MEN'S POST<br>DIVORCE <span>COACHING</span></a>
            </div>
            
            <img src="https://menspostdivorcecoaching.com/images/negative_thinking_loop_graphic.png" class="hero" alt="Kill the Negative Thinking Loop" />
            
            <div class="content">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
                    <tr>
                        <td width="48" valign="middle">
                            <div class="user-avatar" style="width: 48px; height: 48px; border-radius: 50%; background-color: #0b3b36; color: white; text-align: center; line-height: 48px; font-weight: bold; font-family: sans-serif;">GM</div>
                        </td>
                        <td style="padding-left: 15px;" valign="middle">
                            <div class="user-details">
                                <span class="user-name" style="font-weight: 700; color: #1e293b; display: block; font-size: 16px;">Greg Montoya</span>
                                <span class="user-role" style="font-size: 12px; color: #64748b; display: block;">Admin, Post Divorce Advantage</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <h1>Kill the Negative Thinking Loop</h1>
                
                <p>Most men spend months asking the same questions after a divorce:</p>
                
                <div class="question-list">
                    <div class="question-item">Why did this happen?</div>
                    <div class="question-item">Why now?</div>
                    <div class="question-item">Why me?</div>
                </div>

                <p>This is the <strong>"Negative Thinking Loop,"</strong> and it keeps you stuck in neutral.</p>
                
                <p>This Friday at 6 PM, I am hosting a <strong>30-minute intensive</strong> to show you the <strong>Pattern Interrupt</strong>. It is a simple tool to kill the spin and pivot your focus toward clear goals.</p>

                <div class="info-card">
                    <div class="info-row"><strong>When:</strong> Friday, March 6th @ 6 PM (Spain Time)</div>
                    <div class="info-row"><strong>Where:</strong> <a href="https://www.skool.com/post-divorce-advantage/calendar" style="color: #C4613A; font-weight: 700;">Check the Calendar Tab for the link</a></div>
                </div>

                <p style="text-align: center; font-weight: 700; color: #1e293b; margin-top: 30px;">Stop looking back. Start looking forward. See you there.</p>

                <div class="btn-container">
                    <a href="https://www.skool.com/post-divorce-advantage" class="btn">View Post & Register</a>
                </div>
            </div>
            
            <div class="footer">
                <p>Don’t want to be notified of new posts from admins? <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p>
                <div class="skool-branding">POST DIVORCE ADVANTAGE</div>
                <p style="margin-top: 15px;">&copy; 2026 Men's Post-Divorce Coaching. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

module.exports = BaseLayout;
