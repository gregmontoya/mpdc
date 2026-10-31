const BaseLayout = require('./BaseLayout');

const Day3BiologicalGhost = (name) => {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>You know intellectually that the relationship is over. You know she’s toxic. You know you’re better off without the chaos.</p>
        
        <p>So why does your heart still race when her name pops up? Why do you wake up at 3:00 AM with your brain replaying a conversation from three years ago?</p>
        
        <h3>It’s Not a "Feeling." It’s a Chemical State.</h3>
        
        <p>You aren't "replaying the past" because you're weak. You're replaying it because your nervous system is stuck in a <strong>Biological Ghost Loop.</strong></p>
        
        <p>Years of high-conflict "grooming" have re-wired your brain to stay in a permanent state of fight-or-flight. You aren't just emotionally drained—your cortisol is spiked, your testosterone is suppressed, and your Vagus Nerve is "locked."</p>
        
        <p><strong>You cannot think your way out of a biological collapse.</strong></p>
        
        <p>To reclaim your edge, you have to use "Somatic Intercepts." You have to reset the baseline of your biology before you can fix the baseline of your business or your life.</p>
        
        <p>In the <strong>$27 Mastery System</strong>, we have an entire module dedicated to the "Biological Reset." No fluff. Just tactical, biological protocols to unlock your physiology so you can finally hold your frame.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=sequence&utm_campaign=day3_biology" class="btn">Reset Your Biological Baseline</a>
        </center>
        
        <p style="margin-top: 30px;">
            The fog isn't in your head. It's in your system.
        </p>
        
        <p>Stay Sharp,<br>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = Day3BiologicalGhost;
