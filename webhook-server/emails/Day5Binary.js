const BaseLayout = require('./BaseLayout');

const Day5BinaryChoice = (name, email = '') => {
    const firstName = name ? name.split(' ')[0] : 'there';
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>I'm not here to chase you. I'm here to give you a binary choice.</p>
        
        <p>For the last five days, I've shown you why the "Good Guy" approach is failing. I've explained why your biology is working against you, and why explaining yourself is costlier than any legal fee.</p>
        
        <p>You now have two paths:</p>
        
        <p><strong>Path A: The Loop.</strong> You keep doing what you're doing. You keep hoping she "sees reason." You keep reacting to her texts. You keep living in her frame. You know exactly where that leads—more exhaustion, more debt, and more fog.</p>
        
        <p><strong>Path B: The Edge.</strong> You spend $27—the cost of a couple of coffees—to get the tactical blueprint that is currently saving the lives and legacies of over 500 men. You decide that your identity is worth more than a movie ticket.</p>
        
        <p>This is it. I won't be in your inbox every day after this. I don't care about your $27. I care about whether you are the kind of man who takes action when he sees a tactical advantage.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=sequence&utm_campaign=day5_binary${emailParam}" class="btn">Choose the Edge Now</a>
        </center>
        
        <p style="margin-top: 30px;">
            The fog only lifts when you decide to walk out of it.
        </p>
        
        <p>Stay Sharp,<br>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = Day5BinaryChoice;
