const BaseLayout = require('./BaseLayout');

const AbandonedCart1 = (name) => {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = `
        <p>Hi ${firstName},</p>
        
        <p>I noticed you were checking out the <strong>Men's Divorce Mindset System</strong> a few minutes ago, but you didn't finish the process.</p>
        
        <p>Listen, I get it. Life moves fast, or maybe you had a second thought. But I want to remind you why you clicked that button in the first place.</p>
        
        <p>You’re tired of the replay loop. You’re ready to reclaim your edge. And you know that staying where you are isn’t an option.</p>
        
        <p>If you had a technical issue or just got distracted, I’ve saved your spot. You can pick up exactly where you left off right here:</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join" class="btn">Complete Your Comeback</a>
        </center>
        
        <p style="margin-top: 30px; font-style: italic; color: #718096;">
            Note: If you have a specific question about the modules or the guarantee, just reply to this email. I read every message.
        </p>
    `;

    return BaseLayout(content);
};

module.exports = AbandonedCart1;
