
// Native fetch is available in Node 18+
// If running on older node, use: const fetch = require('node-fetch');

async function sendTestNotification() {
    const webhookUrl = 'https://hooks.slack.com/services/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';

    const message = {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🔔 Webhook Alert Test",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "If you see this, the Slack integration is WORKING! 🎉"
                }
            }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
        }

        console.log('✅ Slack test notification sent successfully!');
    } catch (error) {
        console.error('❌ Slack Notification Error:', error.message);
    }
}

sendTestNotification();
