const _ = require("lodash");
const nodemailer = require("nodemailer");
const configs = require("../configs");

function Mailer() {
  this.fromName = configs.mail.fromName || "WorkEvo";
  this.fromEmail = configs.mail.fromEmail || "no-reply@workevo.com";
  this.contentType = "plain/text";
  this.transporter = false;
  this.to = null;
  this.message = null;
  this.headers = null;
  this.subject = null;
  this.attachments = [];

  this.setTransporter();
}

Mailer.prototype.setFromName = function(name) {
  this.fromName = name;
};

Mailer.prototype.setFromEmail = function(email) {
  this.fromEmail = email;
};

Mailer.prototype.setContentType = function(type) {
  this.contentType = type.toLowerCase();
};

Mailer.prototype.setMessage = function(message) {
  this.message = message;
};

Mailer.prototype.setHeaders = function(headers) {
  this.headers = headers;
};

Mailer.prototype.setTo = function(to) {
  if (_.isArray(to)) {
    this.to = to.join(", ");
  } else {
    this.to = to;
  }
};

Mailer.prototype.setSubject = function(subject) {
  this.subject = subject;
};

Mailer.prototype.setAttachments = function(attachments = []) {
  this.attachments = [];
};

Mailer.prototype.isHTML = function() {
  return this.contentType.toLowerCase() == "plain/html";
};

Mailer.prototype.setTransporter = async function() {
  let data = false;
  if (
    configs.mail &&
    configs.mail.options &&
    _.isObject(configs.mail.options) &&
    !_.isEmpty(configs.mail.options)
  ) {
    data = configs.mail.options;
  } else if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
    const account = await nodemailer.createTestAccount();

    data = {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    };
  }

  if (data) this.transporter = nodemailer.createTransport(data);
};

Mailer.prototype.send = async function() {
  if (!this.transporter) {
    return false;
  }

  const self = this;

  const from = `${self.fromName} <${self.fromEmail}>`;

  const options = {
    from: from,
    to: self.to,
    subject: self.subject
  };

  if (self.isHTML()) {
    options.html = self.message;
  } else {
    options.text = self.message;
  }

  try {
    await self.transporter.sendMail(options);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
};

module.exports = new Mailer();
