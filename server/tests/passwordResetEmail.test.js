const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { forgotPassword } = require("../controllers/authController");

const smtpVariables = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "CLIENT_URL",
];

const configureSmtp = (t, sendMail) => {
  const previousValues = Object.fromEntries(
    smtpVariables.map((key) => [key, process.env[key]])
  );
  const originalCreateTransport = nodemailer.createTransport;

  t.after(() => {
    for (const [key, value] of Object.entries(previousValues)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    nodemailer.createTransport = originalCreateTransport;
  });

  process.env.SMTP_HOST = "smtp.example.test";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_SECURE = "false";
  process.env.SMTP_USER = "sender@example.test";
  process.env.SMTP_PASS = "test-password";
  process.env.CLIENT_URL = "http://localhost:5173/";
  nodemailer.createTransport = (options) => {
    assert.equal(options.host, process.env.SMTP_HOST);
    assert.equal(options.port, 587);
    assert.equal(options.secure, false);
    return { sendMail };
  };
};

const stubUserLookup = (t, user) => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: async () => user,
  });
  t.after(() => {
    User.findOne = originalFindOne;
  });
};

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("password reset email behavior", async (t) => {
  await t.test(
    "forgot password emails a one-time reset link without returning its token",
    async (t) => {
      let email;
      const saves = [];
      const user = {
        email: "customer@example.test",
        save: async function () {
          saves.push({
            hash: this.passwordResetTokenHash,
            expiresAt: this.passwordResetTokenExpiresAt,
          });
        },
      };

      stubUserLookup(t, user);
      configureSmtp(t, async (message) => {
        email = message;
      });

      const response = makeResponse();
      await forgotPassword(
        { body: { email: " Customer@Example.Test " } },
        response
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.resetToken, undefined);
      assert.equal(response.body.resetUrl, undefined);
      assert.equal(email.to, user.email);
      assert.match(
        email.text,
        /http:\/\/localhost:5173\/reset-password\/[a-f0-9]{64}/
      );

      const resetToken = email.text.match(
        /reset-password\/([a-f0-9]{64})/
      )[1];
      assert.equal(
        user.passwordResetTokenHash,
        crypto.createHash("sha256").update(resetToken).digest("hex")
      );
      assert.ok(user.passwordResetTokenExpiresAt instanceof Date);
      assert.equal(saves.length, 1);
    }
  );

  await t.test(
    "forgot password invalidates the reset link when email delivery fails",
    async (t) => {
      const user = {
        email: "customer@example.test",
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        save: async function () {},
      };
      stubUserLookup(t, user);
      configureSmtp(t, async () => {
        throw new Error("SMTP unavailable");
      });

      const originalError = console.error;
      console.error = () => {};
      t.after(() => {
        console.error = originalError;
      });

      const response = makeResponse();
      await forgotPassword(
        { body: { email: "customer@example.test" } },
        response
      );

      assert.equal(response.statusCode, 503);
      assert.match(response.body.message, /Unable to send/);
      assert.equal(user.passwordResetTokenHash, null);
      assert.equal(user.passwordResetTokenExpiresAt, null);
    }
  );
});
