const BaseLayout = require('./BaseLayout');

const WelcomeEmail1 = (name, categoryInsight = '') => {
    const firstName = name ? name.split(' ')[0] : 'friend';

    // The Mirror Effect: Insert dynamic content if category is known
    const insightSection = categoryInsight ? `
        <div style="background-color: #f0f7f6; padding: 20px; border-radius: 8px; border-left: 4px solid #0b3b36; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #0b3b36;"><strong>Personalized Insight:</strong> ${categoryInsight}</p>
        </div>
    ` : '';

    const content = `
        <p>Hi ${firstName},</p>
        
        <p>I wanted to reach out and personally welcome you to the Men's Post-Divorce Coaching community.</p>
        
        ${insightSection}

        <p>Whether you've just started your journey or you're deep in the "replay loop," I want you to know one thing: <strong>The version of you that she couldn't handle is still in there.</strong></p>
        
        <p>My goal is simple: to give you the exact framework I used (and hundreds of other men use) to reclaim their frame, rebuild their identity, and finally stop being "mentally owned" by the past.</p>
        
        <p>Over the next few days, I'm going to send you some of my most powerful direct-action strategies. Keep an eye on your inbox.</p>
        
        <p>In the meantime, if you're ready to skip the line and get the full system today, you can find it here:</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join" class="btn">Reclaim Your Edge</a>
        </center>
    `;

    return BaseLayout(content);
};

module.exports = WelcomeEmail1;
