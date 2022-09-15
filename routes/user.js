const express = require(`express`)
const passport = require(`passport`)
const path = require(`path`)
const multer = require(`multer`)
const { User, Ticket, Seat, Image } = require(`../models`)
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
    /* 	#swagger.tags = ['User']
        #swagger.summary = `로그인 상태 유지`
        #swagger.description = '로그인 상태 유지 로그인 필요' */
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

// 로그인
router.post(`/login` , isNotLoggedIn,(req, res, next) => {
    /* 	#swagger.tags = ['User']
        #swagger.summary = `로그인`
        #swagger.description = '로그인'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: '로그인 예',
            schema: {
                $wallet_address: "input",
                $nickname: "dd"
            }

        } */
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
                    exclude: [ `wallet_address`, `CreaterId`, `recordId` ]
                }
            })
            return res.status(200).json(fullUser);
        })
    })(req, res, next)
})

// 로그아웃
router.post(`/logout`, isLoggedIn, (req, res, next) => {
    /* 	#swagger.tags = ['User']
        #swagger.summary = `로그아웃`
        #swagger.description = '로그아웃 로그인 필요'
        */
    req.logout((err) => {
        if (err) { return next(err); }
    });
    res.status(200).send(`로그아웃 되었습니다.`)
})

// 회원 가입
router.post(`/`, isNotLoggedIn,async (req, res, next) => {
    /* 	#swagger.tags = ['User']
        #swagger.summary = `회원 가입`
        #swagger.description = '회원 가입' */
    /*	#swagger.parameters['wallet_address'] = {
            in: 'body',
            description: '지갑 주소',
            schema: {
                $wallet_address: `input`
            }

    } */
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
    /* 	#swagger.tags = ['User']
        #swagger.summary = `유저 정보`
        #swagger.description = '유저 정보'
        #swagger.parameters['{id}'] = {
            in: 'parameters',

            description: '유저 정보 조회',

    } */
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
                where: {id: user.id},
                attributes: {
                    exclude: [`wallet_address`, `CreaterId`, `recordId`]
                }
        })
        res.status(200).json(fullUser)
    }
    catch(error){
        console.error(error)
        next(error)
    }

})

// 유저 티켓 조회
router.get( `/ticket`, isLoggedIn, async(req, res, next) =>{
    /* 	#swagger.tags = ['User']
        #swagger.summary = `유저 티켓 조회`
        #swagger.description = '유저 티켓 조회 로그인 필요' */

    try{
        const user = await User.findOne({
            where: { id: req.user.id},
            attributes: {
                exclude: [`wallet_address`, `CreaterId`, `recordId`]
            },
            include:[{
                model: Ticket,
                as: `Owned`,
                attributes: {
                    exclude: [`OwnerId`]
                },
                include: [{
                    model: Seat,
                    attributes: [`class`,`number`]
                },{
                    model: User,
                    as: `Records`,
                    attributes: [`id`, `nickname`]
                }]
            }]
        })

        res.status(200).json(user);
    }
    catch(err){
        console.error(err)
        next(err)
    }
})

//닉네임 변경

router.patch(`/profile/nickname` , isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['User']
        #swagger.summary = `닉네임 변경`
        #swagger.description = '닉네임 변경'  로그인 필요
        #swagger.parameters['nickname'] = {
            in: 'body',
            description: '원하는 닉네임 입력'

    } */
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
    /* 	#swagger.tags = ['User']
        #swagger.summary = `닉네임 가져오기 `
        #swagger.description = '닉네임 가져오기 로그인 필요' */

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
    /* 	#swagger.tags = ['User']
        #swagger.summary = `프로필 사진 등록`
        #swagger.description = '프로필 사진 등록 로그인 필요'
        #swagger.parameters['image'] = {
            in: 'body',
            description: '프로필 사진 예',
            schema: {
                $image: "example.png"
            }
        }*/

    try {
        const user = await User.findOne({
            where: { id: req.user.id}
        })

        if (req.body.image) {
            { // 이미지를 하나만 올리면 image: 제로초.png
                const image = await Image.create({ src: req.body.image });
                await user.addImage(image);
            }
        }

        console.log(req.body)
        res.status(200).json(req.body.image)
    } catch(err){
        console.error(err)
        next(err)
    }
})
//프로필 사진 저장
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res) => {
    /* 	#swagger.tags = ['User']
        #swagger.summary = `프로필 사진 저장`
    	#swagger.parameters[`image`] = {
            in: 'formData',
            type: 'file',
            description: '프로필 사진 주소'

    } */
    console.log(req.file);
    res.json(req.file.filename)
})

//프로필 사진 가져오기
router.get (`/image`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['User']
    #swagger.summary = `프로필 사진 가져오기`
        #swagger.description = '프로필 사진 가져오기' */

    try{
        const profile_image = await Image.findOne({
            where: { Userid : req.user.id},
            attributes: [ `src` ]
        })
        res.status(200).json(profile_image)
    } catch (error){
        console.error(error)
        next(error)
    }


})


module.exports = router