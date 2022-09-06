const express = require(`express`)

const { Ticket, User, CreateTicket, OwnTicket } = require(`../models`)

const { Op } =require("sequelize")
const {isLoggedIn} = require("./middlewares");

const router = express.Router()



// 판매 티켓 보기
// router.get(`/:performanceId/onsale`, async (req, res, next) => {
//     try{
//         const ticket = await Ticket.findOne({
//             where: { PerformanceId: req.params.performanceId}
//         })
//         const createTicket = await CreateTicket.findAll({})
//         const ownTicket = await OwnTicket.findAll({})
//
//         const ticketCreater = await ticket.getCreates()
//
//         const onsaleTicekts = await Ticket.findAll({
//             where: { status: `SALE`},
//             include: [
//                 {
//                     model: User,
//                     through: {
//                         where: { UserId: ticketCreater.id}
//                     },
//                     as: `Ownes`,
//                     where: { id:  `null`}
//                 },
//                 {
//                     model: User,
//                     through: {
//                         where: { UserId: {
//                                 [Op.ne] : req.user.id
//                             }}
//                     },
//                     as: `Creates`
//                 }
//             ]
//         })
//         if(onsaleTicekts){
//             res.status(200).json(onsaleTicekts)
//         }
//         else{
//             res.status(400).send("판매되는 티켓이 없습니다.")
//         }
//     }
//     catch (e) {
//         console.error(e)
//         next(e)
//     }
// })


// 티켓 상세 정보 보기
router.get(`/:id/detail`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
        #swagger.summary = `티켓 상세 정보 보기`
        #swagger.description = '티켓 상세 정보 보기'
        */
    try{
        const ticket = await Ticket.findOne({
            where: { id: req.params.id},
            include:[
                {
                    model: User,
                    as: `Ownes`
                }
            ]
        })
    if(!ticket){
        return res.status(403).send(`존재하지 않는 티켓입니다.`)
    }
    res.status(201).json(ticket)
    } catch(err){
        console.error(err)
        next(err)
    }
} )

// 티켓 판매 등록
router.patch(`/:ticketId/register`, isLoggedIn, async (req, res, next) => {
    try{

        const ticket = findOne({
            where: {id: req.params.ticketId,
            status: `OWNED`}
        })

        const isOwned = await ticket.getOwnes()
        if(isOwned.id === req.user.id){
            await Ticket.update({
                status: `SALE`
            }, { where: { id: ticket.id}})

            res.status(200).send("티켓 판매 등록을 성공하였습니다.")
        }

        res.status(400).send("티켓 판매 등록을 성공하였습니다.")

    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

// 티켓 구매
router.patch(`/:ticketId/buy`, isLoggedIn, async (req, res, next) => {
    try{
        const ticket = await Ticket.findOne({
            where: {id: req.params.ticketId}
        })
        await Ticket.update({
            status: `OWNED`
        }, { where: { id: ticket.id}})

        const isOwner = await ticket.getOwnes()
        // 리셀일 경우
        if(isOwner){
            await ticket.removeOwnes()
        }

        // 일반 판매일 경우
        else{

        }

        await ticket.addOwnes(req.user.id)

        res.status(200).send("티켓 구매를 성공하였습니다.")
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

// 재판매 티켓 보기
// 수정 사안
router.get(`/resale`, async (req, res, next) => {
    try{
        const ticket = await Ticket.findOne({
            where: { PerformanceId: req.params.performanceId}
        })

        const ticketCreater = await ticket.getCreates()

        const resaleTicekts = await Ticket.findAll({
            where: { status: `SALE`},
            include: [
                {
                    model: User,
                    through: {
                        where: { UserId: {
                                [Op.ne] : ticketCreater.id
                            }
                        }
                    },
                    as: `Ownes`
                },
                {
                    model: User,
                    through: {
                        where: { UserId: {
                                [Op.ne] : req.user.id
                            }
                        }
                    },
                    as: `Creates`
                }
            ]
        })
        if(resaleTicekts){
            res.status(200).json(resaleTicekts)
        }
        else{
            res.status(400).send("등록된 리셀 티켓이 없습니다.")
        }
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

// 티켓 사용하기
router.get(`/:ticketId/useTicket`, isLoggedIn, async (req, res, next) => {
    try{
        const ticekts = await Ticket.update({
            status: `USED`
        },{
            where: {id: req.params.ticketId}
        })
ß
        res.status(200).json(ticekts)
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

// 내 티켓 보기
router.get(`/ticketbook`, isLoggedIn, async (req, res, next) => {
    try{
        const ticekts = await Ticket.findAll({
            where: { id: req.user.id},
            include: [{
                model: User,
                as: `Ownes`,
                where: {id: req.user.id}
            }
            ]
        })

        res.status(200).json(ticekts)
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})
module.exports = router