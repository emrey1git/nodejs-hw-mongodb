import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'İsim alanı zorunludur!'],
    },
    email: {
      type: String,
      required: [true, 'Email alanı zorunludur!'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre alanı zorunludur!'],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// JSON response'ta şifreyi gizle
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Password reset token üretme
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 5 * 60 * 1000; // 5 dakika geçerli

  return resetToken; // Mail için plaintext token döndür
};

const User = model('User', userSchema);

export default User;
