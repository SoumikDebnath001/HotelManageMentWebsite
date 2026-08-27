const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port == 465, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Smart Market" <${config.email.user}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send an email using a Handlebars HTML template
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} templateName - The name of the html template file (without .html)
 * @param {object} context - The variables to inject into the template
 */
const sendTemplateEmail = async (to, subject, templateName, context) => {
  try {
    const templatePath = path.join(__dirname, `../templates/email/${templateName}.html`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(context);
    
    // Create a plain text version optionally, or just rely on HTML
    const text = `Please view this email in a client that supports HTML.`;

    const info = await transporter.sendMail({
      from: `"Smart Market" <${config.email.user}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Template email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending template email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
};
