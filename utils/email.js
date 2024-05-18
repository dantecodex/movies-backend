import nodemailer from "nodemailer"

const sendEmail = async (option) => {
    // Create a Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // Define Email options
    const emailOptions = {
        from: 'Cineflix support<support@cineflix.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOptions);

}

export default sendEmail