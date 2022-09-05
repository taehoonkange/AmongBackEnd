const express = require(`express`)

const { Ticket } = require(`../models`)

const { Op } =require("sequelize")
const {isLoggedIn} = require("./middlewares");

const router = express.Router()


// 판매 티켓 보기


// 티켓 상세 정보 보기
router.get(`/:id/detail`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
        #swagger.summary = `티켓 상세 정보 보기`
        #swagger.description = '티켓 상세 정보 보기'
        */
    try{
        const ticket = await Ticket.findOne({
            where: { id: req.params.id}
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
router.patch(`/:ticketId/sale`, isLoggedIn, async (req, res, next) => {
    try{

        const ticket = findOne({
            where: {id: req.params.ticketId}
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
            status: `OWN`
        }, { where: { id: ticket.id}})

        const isOwner = await ticket.getOwnes()
        if(isOwner){
            await ticket.removeOwnes()
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

router.get(`/resale`, async (req, res, next) => {
    try{
        const resaleTicekts = await Ticket.findAll({
            where: { status: `SALE`},
            include: [
                {
                    model: User,
                    as: Ownes,
                    where: { UserId: {
                        [Op.ne] : `null`
                    }
                    }
                },
                {
                    model: User,
                    as: Creates,
                    where: { UserId: {
                            [Op.ne] : req.user.id
                        }
                    }
                }
            ]
        })
        if(resaleTicekts){
            res.status(200).json(resaleTicekts)
        }
        else{
            res.status(400).send("")
        }
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
                as: Ownes
            }]
        })

        res.status(200).json(ticekts)
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})
module.exports = router