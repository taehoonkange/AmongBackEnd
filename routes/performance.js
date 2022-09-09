const express = require(`express`)
const multer = require(`multer`)
const path = require(`path`)
const fs = require(`fs`)

const { Performance, Ticket, Seat, Image, User } = require(`../models`)

const { isLoggedIn } = require(`./middlewares`)

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

//공연 사진 저장
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res) => {
    /* 	#swagger.tags = ['Performance']
    #swagger.summary = `공연 사진 저장`
        #swagger.description = '공연 사진 저장' */
    console.log(req.file);
    res.json(req.file.filename)
})

//공연 생성
router.post(`/`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Performance']
        #swagger.summary = `공연 생성`
        #swagger.description = '공연 생성'
        #swagger.parameters['performance'] ={
            in: `body`,
            description: `공연 바디 정보`,
            schema: { $ref: "#/definitions/Performance"}
        }
     */
    try{
        const influencer = await User.findOne({
            where: {
                id: req.user.id,
                userType : `INFLUENCER`
            }
        })
        if(!influencer){
            res.status(400).send("인플루언서만 등록 가능합니다.")
        }
        const image = await Image.create({
            src: req.body.image
        })
        // 공연 db 생성
        const performance = await Performance.create({
            title: req.body.title,
            place: req.body.place,
            time: req.body.time,
            limitedAge: req.body.limitedAge,
            term_start_at: req.body.term_start_at,
            term_end_at: req.body.term_end_at,
            start_at: req.body.start_at,
            end_at: req.body.end_at,
            description: req.body.description,
            UserId: req.user.id
        })
        await performance.setImage(image.id)

        await Promise.all( req.body.tickets.map( async (info)=>{
            let numberCount = 0;
            while(numberCount !== parseInt(info.number,10)){
                // 티켓 db 생성
                const ticket = await Ticket.create({
                    name: req.body.title,
                    price: info.price,
                    PerformanceId: performance.id,
                    description: req.body.description
                })

                await ticket.setImage(image.id) // 티켓에 이미지 넣기
                await ticket.addRecords(req.user.id) // 티켓 소유자 기록 넣기
                await influencer.addOwned(ticket.id) // 티켓 소유자 넣기
                await ticket.setCreater(influencer.id) // 티켓 생성자 넣기
                //
                console.log("티켓 생성", info)
                //좌석 db 생성
                await Seat.create({
                    class: info.class,
                    number: parseInt(`${numberCount}`),
                    PerformanceId: performance.id,
                    TicketId: ticket.id
                })

                numberCount += 1;
            }
        }))

        res.status(200).send("공연 정보 생성이 완료 되었습니다.")
    } catch(err){
        console.error(err)
        next(err)
    }
} )

// 행사 검색 조회
router.get(`/:SearchWord/search`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Performances']
        #swagger.summary = `행사 검색 조회`
        #swagger.description = '행사 검색 조회'
        */

    // const regex = /`${req.params.SearchWord}`/;
    try{
        const performances = await Performance.findAll({
        })

        if(!performances){
            return res.status(403).send(`현재는 공연이 없습니다.`)
        }

       const checkingTitle = await Promise.all(performances.map(  (performance) => {
           //regax로 중복검사
           const regex = new RegExp(`${req.params.SearchWord.trim()}`, "g")
           const isExist =performance.title.match(regex)
           console.log(isExist)

           if(!isExist){
                return null
           }
           return performance
        }))
        const result = checkingTitle.filter((element) => element != null);

        res.status(201).json(result)
    } catch(err){
        console.error(err)
        next(err)
    }
} )


// 모든 공연 정보 보기

router.get(`/`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Performances']
        #swagger.summary = `모든 공연 정보 보기`
        #swagger.description = '모든 공연 정보 보기'
        */
    try{
        const performance = await Performance.findAll({
            include:[{
                model: Ticket,
                include:[{
                    model: Seat,
                    attributes: [`class`, `number`]
                }]
            }
            ]
        })
        if(!performance){
            return res.status(403).send(`현재는 공연이 없습니다.`)
        }
        res.status(201).json(performance)
    } catch(err){
        console.error(err)
        next(err)
    }
} )

// 공연 상세 정보 보기

router.get(`/:performerceId/detail`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Performance']
    #swagger.summary = `공연 상세 정보 보기`
        #swagger.description = '공연 상세 정보 보기' */
    try{
        const performance = await Performance.findOne({
            where: { id: req.params.performerceId},
            include:[{
                model: Ticket,
                include:[{
                    model: Seat,
                    attributes: [`class`, `number`]
                }]
            }
            ]
        })
        if(!performance){
            return res.status(403).send(`존재하지 않는 공연입니다.`)
        }
        res.status(201).json(performance)
    } catch(err){
        console.error(err)
        next(err)
    }
} )

module.exports = router