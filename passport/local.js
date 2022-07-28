const passport = require('passport');
const { Strategy: LocalStrategy } = require(`passport-local`);


const { User } = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: `wallet_address`,
        passwordField: `nickname`
    }, async (wallet_address, nickname, done) => {
        try {
            const user = await User.findOne({
                where: { wallet_address }
            });
            if (!user) {
                return done(null, false, { reason: '존재하지 않는 지갑주소입니다!' });
            }
            return done(null, user);

        } catch (error) {
            console.error(error);
            return done(error);
        }
    }));
};
