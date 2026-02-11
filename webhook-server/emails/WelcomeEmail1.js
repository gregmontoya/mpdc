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
        
        <p>Below are the free tools you requested to help you start <strong>deleting limiting beliefs</strong> and reclaiming your future.</p>

        <div style="background-color: #f7fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #0b3b36;">🎁 Your Free Recovery Bundle</h3>
            
            <p style="margin-bottom: 20px;"><strong>1. Free Limiting Beliefs Hypnosis (Audio)</strong><br>
            Use this to bypass the conscious mind and begin deleting the stories that keep you pinned to the past.<br>
            <a href="https://drive.google.com/file/d/1geLDm6BKUZjYDWi93RmUu2fRWsZ00JDE/view" style="color: #C4613A; font-weight: bold;">Listen to the Audio →</a></p>

            <p style="margin-bottom: 0;"><strong>2. Worksheet to Resolve Your Past</strong><br>
            A direct-action framework for identifying and learning from thought loops, negative emotions, and limiting beliefs.<br>
            <a href="https://menspostdivorcecoaching.com/resources/resolve-your-past" style="color: #C4613A; font-weight: bold;">Access the Worksheet →</a></p>
        </div>

        <p>The version of you that she couldn't handle is still in there. My goal is simple: to give you the exact framework I used to rebuild my identity and finally stop being "mentally owned" by the past.</p>
        
        <p>Over the next few days, I'm going to send you some of my most powerful direct-action strategies. Keep an eye on your inbox.</p>
        
        <p>In the meantime, if you're ready to skip the line and get the full system today, you can find it here:</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join" class="btn">Reclaim Your Edge</a>
        </center>
    `;

    return BaseLayout(content);
};

module.exports = WelcomeEmail1;
