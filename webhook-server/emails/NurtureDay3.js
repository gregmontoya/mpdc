const BaseLayout = require('./BaseLayout');

const NurtureDay3 = (name, email = '') => {
    const firstName = name ? name.split(' ')[0] : 'friend';
    const emailParam = email ? `?email=${encodeURIComponent(email)}` : '';

    const content = `
        <p>Hi ${firstName},</p>
        
        <p>A few days ago, I talked about "The replay loop." Today, I want to talk about <strong>Frame.</strong></p>
        <p>In the aftermath of divorce, most men are operating from a "Broken Frame." They are reacting to their ex-wife, reacting to the lawyers, and reacting to their own grief.</p>
        
        <p>When you have No Frame, you have no boundary. And when you have no boundary, you are a target.</p>
        
        <p>The MPDC System isn't just about feeling better. It's about rebuilding your Frame so thick that no external event can shake your internal state.</p>
        
        <p>If you're ready to start the installation, I'm waiting for you inside:</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join${emailParam}" class="btn">Establish Your Frame</a>
        </center>
    `;

    return BaseLayout(content);
};

module.exports = NurtureDay3;
