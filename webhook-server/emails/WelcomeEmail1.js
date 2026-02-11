const BaseLayout = require('./BaseLayout');

const WelcomeEmail1 = (name, email = '', categoryInsight = '') => {
    const firstName = name ? name.split(' ')[0] : 'friend';

    // Tracking Parameters
    const utm = `utm_source=email&utm_medium=welcome_sequence&utm_campaign=recovery_bundle&utm_content=welcome_1_cta&email=${encodeURIComponent(email)}`;

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>If you’re like most men going through divorce, your mind won’t stop replaying the same thoughts: “What went wrong?” “Am I good enough?” “What if I never find another woman like her?”</p>
        
        <p>Those thought loops and emotions don’t just drain you. They block your clarity, your focus, and your ability to confidently rebuild.</p>
        
        <p>Here’s the truth: you don’t have to fight your mind to fix it. You can retrain and reprogram it.</p>
        
        <p>That’s exactly why I created a short hypnosis audio. This is designed to release old beliefs, and reset your focus. It’s about giving your mind permission to let go and create space for your purpose.</p>
        
        <p>When that happens, everything shifts:</p>
        <ul>
            <li>You wake up without the weight of yesterday.</li>
            <li>Your next steps finally make sense.</li>
            <li>You feel motivated.</li>
            <li>You think clearly.</li>
        </ul>
        
        <p>I can confidently say this because my hypnosis audios have been listened to over 1 million times.</p>
        
        <p style="margin-top: 30px; font-weight: bold; color: #0b3b36; font-size: 18px;">🎁 Download your free resources below:</p>

        <p>👉 <a href="https://docs.google.com/document/d/1TTQDHayQ0PpjHgqnrYaBDjfK_QE2nF9BaM2TT5abNdk/edit?tab=t.0#heading=h.ud791fjpk5jk" style="color: #C4613A; font-weight: bold; text-decoration: none;">Download the Resolve Your Past Worksheet here</a></p>

        <p>👉 <a href="https://drive.google.com/file/d/1geLDm6BKUZjYDWi93RmUu2fRWsZ00JDE/view" style="color: #C4613A; font-weight: bold; text-decoration: none;">Download the hypnosis audio here</a></p>

        <p>Your mind already knows how—it's time for you to believe in yourself.</p>
        
        <p>Along with the hypnosis audio, I want to invite you into the <strong>Men's Divorce Mindset System</strong>. This is the exact protocol to resolve the past, delete the limiting beliefs, and rebuild your life on autopilot.</p>
        
        <p>👉 <a href="https://menspostdivorcecoaching.com/join?${utm}" style="color: #C4613A; font-weight: bold; text-decoration: none;">Access the Complete System Now</a></p>
        
        <p>You’ve carried the weight long enough. It’s time to release it.</p>
        
        <p>— Alex Morgan<br>
        <span style="color: #64748b; font-size: 14px;">Rebuild Coaching for Men Post Divorce</span></p>
        
        <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #64748b;">
            <strong>P.S. Ready to take this further?</strong> In a few days, I’m opening up a free 5-Day Post-Divorce Reset & Rebuild course. You’ll learn how to get your focus, confidence, and direction back fast. Watch your inbox.
        </p>
    `;

    return BaseLayout(content);
};

module.exports = WelcomeEmail1;
