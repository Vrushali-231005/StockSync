export const welcomeTemplate = (name, email, password) => `
  <body style="margin: 0; padding: 0; background-color: #eff6ff; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; padding: 20px; border: 2px solid #60a5fa; border-radius: 10px; background-color: #ffffff;">
      
      <!-- Header with simulated icon logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: bold; color: white; margin: 0;">
          StockSync
        </h1>
      </div>

      <h2 style="color: #1e40af; text-align: center; margin-bottom: 15px;">Welcome to the StockSync family 🎉</h2>

      <p>Hi <strong>${name}</strong>,</p>
      <p>Your StockSync account has been successfully created! Here are your login details:</p>

      <!-- Credentials box -->
      <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #60a5fa;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>

      <p style="color: #555;">
        You can now log in and start using StockSync to manage your inventory and tasks efficiently.
      </p>

      <!-- Login button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/login" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Login Now
        </a>
      </div>

      <p>Best Regards,<br><strong>StockSync Team</strong></p>
      <hr style="margin-top: 20px; border-color: #60a5fa;">
      <small style="color: #888;">This is an automated email. Please do not reply.</small>
    </div>
  </body>
`;
