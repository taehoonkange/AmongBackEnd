const express = require(`express`)
const path = require(`path`)
const multer = require(`multer`)
const fs = require(`fs`)
const { User, Community, Communitystatus, Influencer, Image } = require(`../models`)
const {isLoggedIn} = require("./middlewares");

const router = express.Router()

try {
    fs.accessSync(`uploads`)
} catch (err){
    console.log(`uploads 폴더가  없으므로 생성합니다.`)
    fs.mkdirSync(`uploads`);
}

//업로드 메소드
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, `uploads`);
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname)
            const decodedFileName =decodeURIComponent(file.originalname)
            const basename = path.basename(decodedFileName, ext)
            done(null, basename + `_`+ new Date().getTime() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 }
})

//인플루언서 포스터 등록
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res) => {
    /* 	#swagger.tags = ['Influencer']
    #swagger.summary = `인플루언서 포스터 저장`
        #swagger.description = '인플루언서 포스터 저장' */
    console.log(req.file);
    res.json(req.file.filename)
})

// 인플루언서로 변경
router.post(`/register`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Influencer']
     #swagger.summary = `인플루언서로 변경`
     #swagger.description = '인플루언서로 변경'
     #swagger.parameters[`Register`] = {
        in: 'body',
        description: '인플루언서로 변경',
        schema: {
            $name: "인플루언서 이름",
            $description: "소개",
            $image: "example.png"
        }
     }
     */
    try{
        if(req.user.userType === "INFLUENCER"){
            res.status(401).send("이미 인플루언서로 등록이 되어있습니다.")
        }
        else{
            await User.update({
                    userType : `INFLUENCER`
                },
                {where: { id: req.user.id}})

            // 커뮤니티 생성
            const community = await Community.create({
            })
            //커뮤니티 장 등록
            const user = await User.findOne({
                where: { id: req.user.id}
            })
            user.setCommunity(community)
            //커뮤니티 등급 설정
            await Communitystatus.create({
                status: `INFLUENCER`,
                UserId : req.user.id,
                CommunityId: community.id
            })

            const image = await Image.create({
                src: req.body.image
            })

            const influencer = await Influencer.create({
                name: req.body.name,
                description: req.body.description,
                UserId: req.user.id
            })

            // 유저에 인플루언서 연결하기

            await influencer.setImage(image)
            await user.setInfluencer(influencer.id)

            const fullUser = await User.findOne({
                where: {id : req.user.id},
                include: [{
                    model: Influencer,
                }]
            })
            res.status(200).json(fullUser)
        }
    }

    catch (e){
        console.error(e)
        next(e)
    }
})

// 인플루언서들 조회

router.get(`/search`, async(req, res, next) =>{
    try{
        const influencers = await User.findAll({
            where: { userType: `INFLUENCER`},
            order: [
                [Influencer,'createdAt', 'ASC']
            ],
            attributes: [`id`],
            include:[{
                model: Community,
                attributes:[`id`]
            },{
                model: Influencer,
                attributes:{
                  exclude: [`UserId`]
                },
                include:[{
                    model: Image,
                    attributes: [`src`]
                }]
            }]

        })
        if(influencers){
            res.status(200).json(influencers)
        }
        else{
            res.status(400).send("등록된 인플루언서가 없습니다.")
        }

    }
    catch (e) {
        console.error(e)
        next(e)
    }
})


module.exports = router