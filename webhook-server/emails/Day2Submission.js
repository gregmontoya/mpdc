const BaseLayout = require('./BaseLayout');

const Day2SubmissionTrap = (name) => {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = `
        <p>Hey ${firstName},</p>
        
        <p>Quick question: Does your phone give you a "pit in your stomach" feeling every time you see a notification from your ex?</p>
        
        <p>If it does, it's because you are still trapped in the **Submission Loop.**</p>
        
        <h3>The Explanation Tax</h3>
        
        <p>When she sends you a paragraph of accusations, and you respond with 1,000 words of "Logic" and "Fairness," you think you are communicating. You think if you just find the right words, she'll finally see your perspective.</p>
        
        <p><strong>She won't.</strong></p>
        
        <p>In the world of high-conflict divorce, <strong>Explanation is a form of Submission.</strong></p>
        
        <p>Every time you explain your decisions, you are reinforcing the idea that she has the authority to judge them. You are paying a tax on your energy that you cannot afford.</p>
        
        <p>To break the loop, you have to switch to <strong>Binary Communication.</strong></p>
        
        <p>In the "Tactical Communication" module of the Mindset System, I show you exactly how to stop being an "Explainer" and start being a "Closer." We teach you the scripts that end the arguments before they start.</p>
        
        <center>
            <a href="https://menspostdivorcecoaching.com/join?utm_source=email&utm_medium=sequence&utm_campaign=day2_submission" class="btn">Stop the Submission Loop</a>
        </center>
        
        <p style="margin-top: 30px;">
            Stop trying to be heard. Start being handled.
        </p>
        
        <p>Stay Sharp,<br>— Alex Morgan</p>
    `;

    return BaseLayout(content);
};

module.exports = Day2SubmissionTrap;
