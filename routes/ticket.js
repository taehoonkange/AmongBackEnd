const express = require(`express`)

const { Ticket, User } = require(`../models`)

const {isLoggedIn} = require("./middlewares");

const router = express.Router()




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

        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId},
            include:[{
                model:User,
                as: `Ownes`
            }]
            })

        if(ticket.status !== `OWNED`){
            res.status(400).send("이미 판매 중인 티켓입니다.")
        }
        else {
            const isOwned = ticket.Ownes
            if (isOwned[0].id === req.user.id) {
                await Ticket.update({
                    status: `SALE`
                }, {where: {id: ticket.id}})

                res.status(200).send("티켓 판매 등록을 성공하였습니다.")
            }
            else{
                console.log(isOwned[0].id,req.user.id )
                console.log(isOwned.id === req.user.id)
                res.status(400).send("소유자 하지 않은 티켓입니다.")
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
    try{
        const resaleTicket = await Ticket.findOne({
            where: {id: req.params.ticketId,
                status: `SALE`},
            include: [{
                model: User,
                as: `Ownes`
            }]
        })
        // 티켓 존재 여부
        if(!resaleTicket){
            res.status(400).send("리셀 티켓이 아닙니다.")
        }

        // 자기 자신 티켓 사면 안됨
        const ownerId = (await resaleTicket.getOwnes({attributes: [`id`]}))[0].id
        if( req.user.id === ownerId){
            res.status(400).send(" 자기 티켓을 구매할 수 없습니다.")
        }
        else{
            await Ticket.update({
                status: `OWNED`
            }, { where: { id: resaleTicket.id}})
        }

        await resaleTicket.removeOwnes(ownerId)
        await resaleTicket.addOwnes(req.user.id)

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

        const tickets = await Ticket.findAll({
                where: {status: `SALE`},
                include:[{
                    model: User,
                    as: `Ownes`
                },{
                    model: User,
                    as: `Creates`
                }]
            })

        // const processing = await Promise.all(tickets.map((ticket)=>{
        //     const owner = ticket.Ownes[0].id
        //     const creater = ticket.Creates[0].id
        //     const newTicket = Ticket.findOne({
        //         where: { id: ticket.id}
        //     })
        //     if ( owner === creater ){
        //         return null
        //     }
        //     else{
        //         return newTicket
        //     }
        // }))
        // const resaleTicekts = processing.filter((element) => element !== null);


        console.log(tickets)
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
router.get(`/:ticketId/useTicket`, isLoggedIn, async (req, res, next) => {
    try{
        const ticekts = await Ticket.update({
            status: `USED`
        },{
            where: {id: req.params.ticketId}
        })

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