const express = require(`express`)

const { Ticket, User, Image } = require(`../models`)

const {isLoggedIn} = require("./middlewares");

const router = express.Router()




// 티켓 상세 정보 보기

// 소유자, 생성자
router.get(`/:id/detail`,  async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
        #swagger.summary = `티켓 상세 정보 보기`
        #swagger.description = '티켓 상세 정보 보기'
        */
    try{
        const ticket = await Ticket.findOne({
            where: { id: req.params.id},
            include:[{
                model: User,
                as: `Records`,
                attributes: [`id`, `nickname`],
                include:[{
                    model: Image,
                    attributes: [`src`]
                }]
                },{
                model: User,
                as: `Creater`,
                attributes: [`id`, `nickname`],
                include:[{
                    model: Image,
                    attributes: [`src`]
                }]
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
// 티켓 판매 등록 취소
router.patch(`/:ticketId/cancel`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 판매 등록 취소`
    #swagger.description = '티켓 판매 등록 취소'
    */
    try{
        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId}
        })

        if(ticket.status === `OWNED`){
            res.status(400).send("판매 등록한 티켓이 아닙니다.")
        }

        if ( ticket.UserId !== req.user.id) {
            await Ticket.update({
                status: `OWNED`
            }, {where: {id: ticket.id}})

            res.status(200).send("티켓 판매 등록을 취소하였습니다.")
        }
        else{
            res.status(400).send("소유 하지 않은 티켓입니다.")
        }


    }

    catch (e) {
        console.error(e)
        next(e)
    }
})
// 티켓 판매 등록

router.patch(`/:price/:ticketId/register`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 판매 등록`
    #swagger.description = '티켓 판매 등록'
    */
    try{

        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId},
            })

        if(ticket.status !== `OWNED`){
            res.status(400).send("이미 판매 중인 티켓입니다.")
        }
        else {
            if (ticket.UserId === req.user.id) {
                await Ticket.update({
                    status: `SALE`,
                    price: req.params.price
                }, {where: {id: ticket.id}})

                res.status(200).send("티켓 판매 등록을 성공하였습니다.")
            }
            else{
                // console.log(isOwned[0].id,req.user.id )
                // console.log(isOwned.id === req.user.id)
                res.status(400).send("소유 하지 않은 티켓입니다.")
            }
        }
    }

    catch (e) {
        console.error(e)
        next(e)
    }
})

// 티켓 구매
router.patch(`/:ticketId/buy`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 구매`
    #swagger.description = '티켓 구매'
    */
    try{
        const saleTicket = await Ticket.findOne({
            where: {id: req.params.ticketId,
                status: `SALE`}
        })
        // 티켓 구매 여부
        if(!saleTicket){
            res.status(400).send("이 티켓은 살 수 없습니다.")
        }

        // 자기 자신 티켓 사면 안됨
        if( req.user.id === saleTicket.UserId){
            res.status(400).send(" 자기 티켓을 구매할 수 없습니다.")
        }
        // 구매, 소유권 양도
        else{
            await Ticket.update({
                status: `OWNED`,
                UserId: req.user.id
            }, { where: { id: saleTicket.id}})
        }

        //소유자 기록
        await saleTicket.addRecords(req.user.id)
        res.status(200).send("티켓 구매를 성공하였습니다.")
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})


// 리셀 티켓 보기
router.get(`/resale`, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `리셀 티켓 보기`
    #swagger.description = '리셀 티켓 보기'
    */
    try{

        const tickets = await Ticket.findAll({
                where: {status: `SALE`}
            })

        if(tickets){
            res.status(200).json(tickets)
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
router.patch(`/:ticketId/useTicket`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 사용`
    #swagger.description = '티켓 사용'
    */
    try{
        await Ticket.update({
            status: `USED`
        },{
            where: {id: req.params.ticketId}
        })

        res.status(200).send("티켓을 사용합니다.")
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})


module.exports = router