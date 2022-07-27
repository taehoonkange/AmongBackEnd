const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local').Strategy;


const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        walletaddressField: 'wallet_address'
    }, async (wallet_address, done) => {
        try {
            const exUser = await User.findOne({ where: { wallet_address } });
            if (exUser) {
                return done(null, exUser)

            } else {
                return done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            return done(error);
        }
    }));
};