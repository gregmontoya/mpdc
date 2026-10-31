const BaseLayout = require('./BaseLayout');

const Day1IdentityMurder = (name) => {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>Yesterday, you took a step toward reclaiming your life. You grabbed the worksheet, you identified the "Fog," and hopefully, you started to see the scripts she’s been using to keep you in check.</p>
        
        <p>But today, we have to talk about the hardest part of this process.</p>
        
        <h3>The "Good Guy" Trap</h3>
        
        <p>If you're like most men I coach, you’ve spent the last year (or decade) trying to prove to your wife that you are a "Good Man."</p>
        
        <p>When she accused you of being manipulative, you explained. When she called you "angry," you became passive to prove you weren't. You have been defending a version of yourself that she has already decided to destroy.</p>
        
        <p><strong>Here is the hard truth: That version of you—the one seeking her validation—needs to die.</strong></p>
        
        <p>To win your divorce and your sanity, you must stop being the "Good Guy" in her story and start being the <strong>CEO of your own.</strong></p>
        
        <p>A CEO doesn't defend his character to people who are actively trying to liquidate his company. He protects the assets. He holds the frame. He executes the mission.</p>
        
        <p>In the <strong>$27 Mastery System</strong>, the first thing we do is perform a "Controlled Burn" of your old identity so we can build the one she can't handle.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=sequence&utm_campaign=day1_identity" class="btn">Reclaim Your Edge Now</a>
        </center>
        
        <p style="margin-top: 30px;">
            Stop trying to save a version of yourself that no longer serves your future.
        </p>
        
        <p>Stay Sharp,<br>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = Day1IdentityMurder;
