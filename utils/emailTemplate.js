export const verifyEmailTemplate = (name, link) => `
<h2>Hello ${name},</h2>
<p>Welcome! Please verify your email to activate your account.</p>
<a href="${link}" style="padding:10px 20px;background:#000;color:#fff;text-decoration:none;">
Verify Email
</a>
<p>This link will expire in 15 minutes.</p>
`;

export const resetPasswordTemplate = (link) => `
<h2>Password Reset Request</h2>
<p>Click below to reset your password.</p>
<a href="${link}" style="padding:10px 20px;background:#000;color:#fff;text-decoration:none;">
Reset Password
</a>
<p>If you didn’t request this, ignore this email.</p>
`;
