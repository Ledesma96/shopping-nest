import 'dotenv/config';
import * as nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    host: 'grupoalvait@gmail.com',
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.USER_MAILING,
        pass: process.env.PASSWORD_MAILING,
    },
});

const verifyMail = (data) => {
    const mailOptions = {
        from: 'logistica@gmail.com',
        to: data.email,
        subject: 'Verify email',
        html:`
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Verificación de cuenta</title>
            <style>
                body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                }
                .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .button {
                display: inline-block;
                padding: 12px 20px;
                margin-top: 20px;
                background-color: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                }
                .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <h2>¡Verifica tu cuenta!</h2>
                <p>Hola,</p>
                <p>Gracias por registrarte en <strong>MiApp</strong>. Para completar tu registro, por favor haz clic en el siguiente botón para verificar tu correo electrónico:</p>
                <a href=${data.url} class="button">Verificar correo</a>
                <p>Si no te registraste en nuestra plataforma, puedes ignorar este mensaje.</p>

                <div class="footer">
                <p>&copy; 2025 MiApp. Todos los derechos reservados.</p>
                </div>
            </div>
            </body>`
    }
    return mailOptions
}


export { transport, verifyMail };
