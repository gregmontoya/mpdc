const BaseLayout = require('./BaseLayout');

const AbandonedCart1 = (name, email = '') => {
    const firstName = name ? name.split(' ')[0] : 'there';
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>I saw you were on the verge of claiming the <strong>Men's Divorce Mindset System</strong>, but then you disappeared.</p>
        
        <p>Was it a distraction? Or did the "replay loop" win again?</p>
        
        <p>The easiest thing to do right now is nothing. To stay in the frame she built for you. To keep replaying the same tired scripts until you're exhausted.</p>
        
        <p>But you aren't here for "easy." You're here because you know that version of you has to die so the man she couldn't handle can take over.</p>
        
        <p>I’ve saved your spot. The system is ready. The framework for your identity rebuild is waiting for you.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_bundle${emailParam}" class="btn">Complete Your Comeback Now</a>
        </center>
        
        <p style="margin-top: 30px;">
            Don't let a 20-minute distraction cost you the next 20 years.
        </p>

        <p>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = AbandonedCart1;
