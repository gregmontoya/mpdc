const BaseLayout = require('./BaseLayout');

const WinBack1 = (name) => {
    const firstName = name ? name.split(' ')[0] : 'friend';

    const content = `
        <p>Hi ${firstName},</p>
        
        <p>I noticed it's been a little while since you logged into the <strong>Men's Divorce Mindset System</strong>.</p>
        
        <p>Listen, the hardest part of any transformation isn't the start—it's the middle. It's when the initial motivation fades and the old habits start creeping back in.</p>
        
        <p>I don't want you to fall back into the loop. You made a commitment to yourself when you joined this system. I'm here to make sure you keep it.</p>
        
        <p>Jump back into <strong>Module 2 (Identity Shifts)</strong> today. Even 10 minutes will reset your momentum.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/system/login" class="btn">Jump Back In</a>
        </center>
    `;

    return BaseLayout(content);
};

module.exports = WinBack1;
