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

//공연 정보 저장
router.post(`/`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Performance']
        #swagger.summary = `공연 정보 저장`
        #swagger.description = '공연 정보 저장'
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
        const image = Image.create({
            src: req.body.image
        })
        // 공연 db 생성
        const performance = await Performance.create({
            title: req.body.title,
            place: req.body.place,
            time: req.body.time,
            term_start_at: req.body.term_start_at,
            term_end_at: req.body.term_end_at,
            start_at: req.body.start_at,
            end_at: req.body.end_at,
            description: req.body.description,
            madeBy: req.user.id,
            ImageId: image.id
        })

        let numberCount = 1;
        let end = 0;
        await Promise.all(req.body.infos.map(info=>{
            end += parseInt(info.number);
            let fixed_end = end + 1
            while(numberCount !== fixed_end){

                // 티켓 db 생성
                const ticket = Ticket.create({
                    name: req.body.title,
                    number: parseInt(`${numberCount}`),
                    PerformanceId: performance.id,
                    description: req.body.description
                })
                //좌석 db 생성
                Seat.create({
                    class: info.class,
                    price: info.price,
                    number: parseInt(`${numberCount}`),
                    PerformanceId: performance.id,
                    TicketId: ticket.id
                })


                numberCount += 1;
            }
        }))

        const user = await User.findOne({
            where: { id: req.user.id}
        })
        const tickets = await Ticket.findAll({
            where: { PerformanceId: performance.id}
        })

        await user.addCreated(tickets.map( ticket => ticket.id))

        await user.addOwned(tickets.map( ticket => ticket.id))



        res.status(200).send("공연 정보 생성이 완료 되었습니다.")
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

router.get(`/id/:id`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Performance']
    #swagger.summary = `공연 상세 정보 보기`
        #swagger.description = '공연 상세 정보 보기' */
    try{
        const performance = await Performance.findOne({
            where: { id: req.params.id}
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