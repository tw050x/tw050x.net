#!/usr/bin/env node
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: ./hash-password.js <password>');
  process.exit(1);
}

const rounds = 10;
bcrypt.
  hash(password, rounds).
  then((hash) => {
    console.log(`Hashed password: ${hash}`)
  }).
  catch((err) => {
    console.error(err);
    process.exit(1);
  });
