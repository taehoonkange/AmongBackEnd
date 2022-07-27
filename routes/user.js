const express = require(`express`)
const passport = require(`passport`)
const multer = require(`multer`)
const { User, Ticket } = require(`../models`)
const { isLoggedIn, isNotLoggedIn} = require(`./middlewares`)
const router = express.Router()
const fs = require(`fs`)

try {
    fs.accessSync(`uploads`)
} catch (err){
    console.log(`uploads 폴더가  없으므로 생성합니다.`)
    fs.mkdirSync(`uploads`);
}

//로그인 상태 유지
router.get( `/`, async(req, res, next) =>{
    try{
        if(req.user){
            const fullUserWithoutWalletAddress = await user.findOne({
                where: {id: req.user.id},
                attributes: {
                    exclude: [`wallet_address`]
                }
            });
            res.status(200).json(fullUserWithoutWalletAddress);
        } else{
            res.status(200).json(null);
        }
    }
    catch(err){
        console.error(err)
        next(err)
    }
})

// 유저 티켓북 가져오기
router.get( `/ticket`, isLoggedIn, async(req, res, next) =>{
    try{
        const ticket = await ticket.findAll({
            where: {UserId: req.user.id}

        });
        res.status(200).json(ticket);
    }
    catch(err){
        console.error(err)
        next(err)
    }
})

// 로그인
router.post(`/login` , isNotLoggedIn,(req, res, next) => {
    passport.authenticate(`local`, (err, user, info) => {
        if (err){
            console.error(err)
            return next(err)
        }
        if (info){
            return res.status(401).send(info.reason)
        }
        return req.login(user, async (loginErr) => {
            if(loginErr) {
                console.error(loginErr)
                return next(loginErr)
            }
            const fullUser = await User.findOne({
                where: { id: user.id},
                include: [{
                    model: Ticket
                }]
            })
            return res.status(200).json(fullUser);
        })
    })(req, res, next)
})

// 로그아웃
router.post(`/logout`, isLoggedIn, (req, res, next) => {
    req.logout()
    req.session.destroy()
    res.send(`로그아웃 되었습니다.`)
})

// 회원 가입
router.post(`/`, isNotLoggedIn,async (req, res, next) => {
    try {
        const exUser = await User.findOne({
            where: {
                wallet_address: req.body.wallet_address
            }
        })
        if(exUser){
            return res.status(403).send(`이미 생성되었습니다.`)
        }
        await User.create({
            wallet_address: req.body.wallet_address
        })
        res.status(201).send(`로그인에 성공하였습니다.`)
    }
    catch(error){
        console.error(err)
        next(error)
    }

})

//닉네임 변경

router.patch(`/profile/nickname` , isLoggedIn, async (req, res, next) => {
    try {
        await User.update({
            nickname: req.body.nickname
        }, {
            where: { id: req.user.id}
        });
        req.status(200).json({ nickname: req.body.nickname})
    } catch(err){
        console.error(err)
        next(err)
    }
})
//업로드 메소드
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, `uploads`);
        },
        filename(req, file, done){
            const ext = path.extname(file.originalnameginalname)
            const basename = path.basename(file.originalname, ext)
            done(null, basename + `_`+ new Date().getTime() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 }
})

//프로필 사진 저장
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res, next) => {
    console.log(req.files);
    res.json(req.files.map((v) => v.filename))
})

//프로필 사진 등록
router.patch(`/profile/image` , isLoggedIn, upload.none(),async (req, res, next) => {
    try {
        if (req.body.image){
            await User.update({
                img_src: req.body.image
            }, {
                where: { id: req.user.id}
            });
            req.status(200).json({ img_src: req.body.img_uri})
        }

    } catch(err){
        console.error(err)
        next(err)
    }
})
module.exports = router