const express = require(`express`)
const passport = require(`passport`)
const path = require(`path`)
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
            const fullUserWithoutWalletAddress = await User.findOne({
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

// 유저 티켓 조회
router.get( `/ticket`, isLoggedIn, async(req, res, next) =>{
    try{
        const ticket = await Ticket.findAll({
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
                attributes: {
                    exclude: [ `wallet_address` ]
                },
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
    req.logout((err) => {
        if (err) { return next(err); }
    });
    res.status(200).send(`로그아웃 되었습니다.`)
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
        res.status(201).send(`회원가입에 성공하였습니다.`)
    }
    catch(error){
        console.error(error)
        next(error)
    }

})

// 유저 정보
router.get(`/id/:id`, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        })
        if(!user){
            return res.status(403).send(`존재 하지 않는 유저입니다.`)
        }
        const fullUser = await User.findOne({
            where: { id: user.id},
            attributes: {
                exclude: [ `wallet_address` ]
            },
            include: [{
                model: Ticket
            }]
        })
        res.status(200).json(fullUser)
    }
    catch(error){
        console.error(error)
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
        res.status(200).json({ nickname: req.body.nickname})
    } catch(err){
        console.error(err)
        next(err)
    }
})

//닉네임 가져오기

router.get(`/profile/nickname` , isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id},
            attributes: [ `nickname`]
        });
        res.status(200).json(user)
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
            const ext = path.extname(file.originalname)
            const basename = path.basename(file.originalname, ext)
            done(null, basename + `_`+ new Date().getTime() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 }
})

//프로필 사진 등록
router.patch(`/profile/image` , isLoggedIn, upload.none(),async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id}
        })
        await user.update({
            img_src: req.body.image
        })
        console.log(req.body)
        res.status(200).json(req.body.image)
    } catch(err){
        console.error(err)
        next(err)
    }
})
//프로필 사진 저장
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res, next) => {
    console.log(req.file);
    res.json(req.file.filename)
})

//프로필 사진 가져오기
router.get (`/image`, isLoggedIn, upload.none(), async (req, res, next) => {
    try{
        const profile_image = await User.findOne({
            where: { id : req.user.id},
            attributes: [ `img_src` ]
        })
        res.status(200).json(profile_image)
    } catch (error){
        console.error(error)
        next(error)
    }


})

module.exports = router