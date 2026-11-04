<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset password</title>
</head>
<body style="margin: 0; padding: 24px; background: #f4f5f7; font-family: Arial, sans-serif; color: #171717;">
    <div style="max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
        <h1 style="margin: 0 0 16px; font-size: 24px;">Reset your password</h1>
        <p style="margin: 0 0 24px; line-height: 1.6;">
            We received a request to reset your Bank Mini password. This link expires in 15 minutes.
        </p>
        <a href="{{ $resetUrl }}" style="display: inline-block; padding: 12px 20px; background: #000000; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Reset Password Now
        </a>
        <p style="margin: 24px 0 0; color: #737373; font-size: 13px; line-height: 1.5;">
            If you did not request this, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
