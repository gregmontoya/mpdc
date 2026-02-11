/**
 * MPDC Premium Email Base Layout
 * Sophisticated Dark Mode / Deep Green Theme
 */
const BaseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding-bottom: 40px;
        }
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            color: #1a202c;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background-color: #0b3b36; /* Deep Steel Green */
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 800;
        }
        .header span {
            color: #C4613A; /* Burnt Copper */
        }
        .content {
            padding: 40px;
            line-height: 1.6;
            font-size: 16px;
            color: #2d3748;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #C4613A;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 20px;
        }
        .signature {
            border-top: 1px solid #edf2f7;
            margin-top: 40px;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <center>
            <table class="main" width="100%">
                <tr>
                    <td class="header">
                        <h1>MPDC<span>.</span></h1>
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        ${content}
                        <div class="signature">
                            <p>To your comeback,<br><strong>Alex Morgan</strong><br><span style="color: #718096; font-size: 13px;">Founder, Men's Post-Divorce Coaching</span></p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        &copy; ${new Date().getFullYear()} Men's Post-Divorce Coaching. All rights reserved.<br>
                        If you'd like to reach us, simply reply to this email.<br>
                        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #718096;">Unsubscribe</a>
                    </td>
                </tr>
            </table>
        </center>
    </div>
</body>
</html>
`;

module.exports = BaseLayout;
