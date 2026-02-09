const { Resend } = require('resend');

// NOTE: Hardcoded key for testing only
const resend = new Resend('re_826p4k1n_E2vQJ3k4m5p6q7r8s9t0');

const name = "Greg Test";
const email = "greg@example.com"; // Change to your real email to see it!
const tempPassword = "test-password-123";

const emailHtml = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f1f5f9; padding: 40px 20px;">
    <div style="background-color: #1e293b; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">The Men's Divorce<br><span style="color: #C4613A;">Mindset System</span></h1>
    </div>
    <div style="background-color: #ffffff; padding: 50px 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700;">Welcome to the Course, ${name}.</h2>
        <p style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">You've just taken the most important step. Most men let divorce define them. You have chosen to <strong style="color: #0f172a;">define your future.</strong></p>
        <p style="color: #475569; line-height: 1.7; font-size: 16px;">This system is not about "coping." It's about rebuilding your identity from the ground up. Your account has been instantly created.</p>
        
        <div style="background-color: #f8fafc; border-left: 6px solid #C4613A; padding: 30px; margin: 35px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">LOGIN EMAIL</p>
            <p style="margin: 0 0 25px 0; color: #0f172a; font-size: 18px; font-weight: 600;">${email}</p>
            
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">TEMPORARY PASSWORD</p>
            <p style="margin: 0; color: #C4613A; font-size: 20px; font-weight: 700; font-family: monospace; letter-spacing: 1px; background: rgba(196, 97, 58, 0.1); display: inline-block; padding: 5px 10px; border-radius: 4px;">${tempPassword}</p>
        </div>

        <div style="text-align: center; margin-top: 45px; margin-bottom: 20px;">
            <a href="https://menspostdivorcecoaching.com/system/login" style="background-color: #C4613A; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(196, 97, 58, 0.4);">Enter The System &rarr;</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            You can change your password anytime from your profile settings.<br>Questions? Reply directly to this email.
        </p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Men's View LLC. All rights reserved.
    </div>
</div>`;

console.log("---------------------------------------------------");
console.log(" PREVIEW OF EMAIL FOR: " + email);
console.log("---------------------------------------------------");
console.log(emailHtml);
console.log("---------------------------------------------------");
