const express = require(`express`)
const multer = require(`multer`)
const path = require(`path`)
const fs = require(`fs`)

const { Performance, Ticket, Seat } = require(`../models`)

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
            const basename = path.basename(file.originalname, ext)
            done(null, basename + `_`+ new Date().getTime() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 }
})

//공연 사진 저장
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res, next) => {
    console.log(req.file);
    res.json(req.file.filename)
})

//공연 정보 저장
router.post(`/`, isLoggedIn, upload.none(), async (req, res, next) => {
    try{
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
            img_src: req.body.image,
            UserId: req.user.id
        })

        let i = 1;
        let end = 0;
        const tickets = await Promise.all(req.body.infos.map(info=>{
            end += parseInt(info.number);
            let fixed_end = end + 1
            while(i !== fixed_end){
                // 티켓 db 생성
                Ticket.create({
                    name: req.body.title,
                    description: req.body.description,
                    img_src: req.body.image,
                    allow_resale: req.body.allow_resale,
                    UserId: req.user.id,
                    number: parseInt(`${i}`),
                    PerformanceId: performance.id
                })
                i += 1;
            }
        }))

        await Ticket.update({
            status: `RESALE`
        },{
            where: { allow_resale: true}
        })

        await performance.addTickets(tickets);

        i = 1;
        end = 0;
        const seats = await Promise.all(req.body.infos.map(info=>{
            end += parseInt(info.number);
            let fixed_end = end + 1
            while(i !== fixed_end){

                //좌석 db 생성
                Seat.create({
                    class: info.class,
                    price: info.price,
                    number: parseInt(`${i}`),
                    PerformanceId: performance.id
                })

                i += 1;
            }
        }))


        await performance.addSeats(seats);

        res.status(200).json(performance)
    } catch(err){
        console.error(err)
        next(err)
    }
} )
// 공연 상세 정보 보기

router.get(`/id/:id`,  async (req, res, next) => {
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