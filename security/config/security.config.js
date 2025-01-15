module.exports = {
  jwt: {
    expiresIn: '1d',
    algorithm: 'HS256'
  },
  password: {
    saltRounds: 12,
    minLength: 8
  },
  session: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  }
};
