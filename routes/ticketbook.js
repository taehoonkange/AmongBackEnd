const express = require(`express`)
const multer = require(`multer`)
const path = require(`path`)
const fs = require(`fs`)

const { Ticket, Seat, Image } = require(`../models`)

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



// 티켓 꾸미기

router.patch(`/:ticketId/coordinate`, isLoggedIn, upload.none(), async (req, res, next) =>{
    /* 	#swagger.tags = ['TicketBook']
    #swagger.summary = `티켓 꾸미기`
    #swagger.description = '티켓 꾸미기'
    */
    try{
        // 소유한 티켓?
        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId,
            UserId: req.user.id}
        })
        if(!ticket){
            res.status(400).send("다른 사람의 티켓입니다.")
        }
        await Image.update({
            src: req.body.image
        }, {where: {TicketId: ticket.id}})

        await Ticket.update({
            coordinate: true
        }, { where : { id: ticket.id}})

    }catch (e){
        console.error(e)
        next(e)
    }
})

// 티켓북
// ticketbook으로 이동하고 수정 필요!!

router.get(`/tickets`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['TicketBook']
    #swagger.summary = `티켓북`
    #swagger.description = '티켓북'
    */

    try{
        const ticekts = await Ticket.findAll({
            where: { status: `USED`},
            include: [{
                model: Seat
            },
                {
                model: Image,
                attributes: [`src`]
            }]
        })
        if(!ticekts){
            res.status(400).send("티켓이 존재하지 않습니다.")
        }
        res.status(200).json(ticekts)
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

module.exports = router