const BaseLayout = require('./BaseLayout');

const Day4LegacyWarning = (name, email = '') => {
    const firstName = name ? name.split(' ')[0] : 'there';
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>I want you to think about something that most men in the "Divorce Fog" completely ignore.</p>
        
        <p>This isn't just about your bank account. It's not just about her rage. It's about the **Standard** you are setting for the next generation.</p>
        
        <h3>Your Sons are Watching</h3>
        
        <p>If your sons see you as a shell of a man—reacting to every emotional grenade she throws, explaining yourself to a woman who doesn't respect you, and living in a state of passive "numbness"—then **that is the version of "Manhood" they will inherit.**</p>
        
        <p>They are watching to see if you can hold your frame under fire. They are learning how to deal with conflict by watching you.</p>
        
        <p>You have a choice right now: You can be her "Warning," or you can be their "Example."</p>
        
        <p>The <strong>$27 Mastery System</strong> isn't just a set of videos. It is the tactical blueprint for building a <strong>Legacy Standard</strong> that exists independently of the wreckage of your marriage.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=sequence&utm_campaign=day4_legacy${emailParam}" class="btn">Become the Example</a>
        </center>
        
        <p style="margin-top: 30px;">
            The best gift you can give your children is the sight of their father reclaiming his edge.
        </p>
        
        <p>Stay Sharp,<br>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = Day4LegacyWarning;
