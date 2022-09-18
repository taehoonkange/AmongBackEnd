const express = require(`express`)

const { Ticket, User, Image, Performance } = require(`../models`)

const {isLoggedIn} = require("./middlewares");
const {Op} = require("sequelize");

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
                as: `Creates`,
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
            where: { id: req.params.ticketId, status : `SALE`},
            include:[{
                model: User,
                as: `Creates`,
                attributes:[ `id`, `nickname`]
            }]
        })
        if (!ticket){
            res.status(200).send("판매 취소를 할 수 없습니다.")
        }
        const createrId = ticket.Creates[0].id
        if ( createrId !== req.user.id) {
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
// performance status
router.patch(`/:price/:ticketId/register`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 판매 등록`
    #swagger.description = '티켓 판매 등록'
    */
    try{

        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId},
            include:[{
                model: User,
                as: `Creates`,
                attributes:[ `id`, `nickname`]
            }]
        })

        if(!ticket){
            res.status(400).send("존재 하지 않는 티켓입니다.")
        }
        else{
            const createrId = ticket.Creates[0].id
            if ( ticket.status === `EXPIRED`){
                res.status(400).send("공연 기간이 지난 티켓입니다.")
            }
            else if ( ticket.status === `USED`){
                res.status(400).send("사용된 티켓은 판매할 수 없습니다.")
            }
            else if (ticket.status === `SALE`){
                res.status(400).send("판매 등록된 티켓입니다.")
            }
            // 티켓 소유자랑 생성자가 같을 때
            else if (createrId === req.user.id){
                res.status(400).send("티켓 발행자는 판매 등록할 수 없습니다..")
            }
            else {
                if (ticket.OwnerId === req.user.id) {
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
    }

    catch (e) {
        console.error(e)
        next(e)
    }
})

// 티켓 구매
router.post(`/buy`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Ticket']
    #swagger.summary = `티켓 구매`
    #swagger.description = '티켓 구매'
    #swagger.parameters['buy'] ={
            in: `body`,
            description: `티켓 사용`,
            schema: { $seats: [1, 2]}
        }
    */
    try{
        const seatsnumber = req.body.seats
        const tickets = []
        await  Promise.all(seatsnumber.map( async number=> {
            const saleTicket = await Ticket.findOne({
                where: {id: number,
                    status: `SALE`},
                include:[{
                    model: User,
                    as: `Creates`,
                    attributes:[ `id`, `nickname`]
                }]
            })

            // 티켓 구매 여부
            if(!saleTicket){
                return
            }
            else{
                const createrId = saleTicket.Creates[0].id
                console.log(saleTicket)
                // 자기 자신 티켓 사면 안됨
                if( req.user.id === saleTicket.OwnerId){
                    return
                }
                // 자기가 발행한 티켓 사면 안됨
                else if(req.user.id === createrId){
                    return
                }
                // 구매, 소유권 양도
                else{
                    await Ticket.update({
                        status: `OWNED`,
                        OwnerId: req.user.id
                    }, { where: { id: saleTicket.id}})

                    //소유자 기록
                    await saleTicket.addRecords(req.user.id)
                    tickets.push(saleTicket)
                }

            }
        }))
        if(Array.isArray(tickets) && tickets.length === 0){
            return  res.status(400).send("티켓 구매를 실패하였습니다.")
        } else if(Array.isArray(tickets) && tickets.length < seatsnumber.length){
            return  res.status(400).send("일부 티켓만 구매 되었습니다.")
        }
        return res.status(200).send("티켓 구매를 성공하였습니다.")
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
        const currentTime = new Date()

        const performances = await Performance.findAll({
            include: [{
                model: Ticket,
                where: {status: `SALE`},
                include: [{
                    model: User,
                    as: `Creates`,
                    attributes: [`id`]
                }, {
                    model : Image,
                    attributes: [`src`]
                }]
            }]
        })
        console.log(JSON.stringify(performances))
        performances.map( async performance => {
            const closed = new Date(performance.term_end_at)
            const endTime = new Date (performance.end_at)
            closed.setHours(endTime.getHours(), endTime.getMinutes())
            if( currentTime >= closed ){
                // 공연 상태 : INPROCESS => DONE
                // 티켓 상태 : SALE(공연 판매)=> EXPIRED
                //           SALE(리셀 판매),OWNED => USED
                await Performance.update({
                    performanceStatus: `DONE`
                }, {where: {id: performance.id}})

                const tickets = await Ticket.findAll({
                    where: { PerformanceId: performance.id}
                })
                await Promise.all(tickets.map( async (ticket) =>{
                    await Ticket.update({
                        status: `EXPIRED`
                    }, {where: {id: ticket.id, status: `SALE`, OwnerId: performance.UserId}})
                }))

                await Promise.all(tickets.map( async (ticket) =>{
                    await Ticket.update({
                        status: `USED`
                    }, {where: {id: ticket.id, status: {
                                [Op.or]: [`OWNED`, `SALE`]
                            }}})
                }))

            }
        })


        let ticketList = []
        await Promise.all (performances.map(  (perform) => {
            const createrId = perform.Tickets[0].Creates[0].id
            perform.Tickets.map( async (ticket) =>{
                // 리셀 티켓
                if( ticket.OwnerId !== createrId){
                    ticketList.push(ticket)
                }
            })
        } ))

        if(Array.isArray(ticketList) && ticketList.length === 0) {
            res.status(400).send("등록된 리셀 티켓이 없습니다.")
        }else{
            res.status(200).json(ticketList)
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
        const ticket = await Ticket.findOne({
            where: { id: req.params.ticketId},
            include: [{
                model: User,
                as: `Creates`,
                attributes: [`id`]
            }]
        })

        const performance = await Performance.findOne({
            where: { id: ticket.PerformanceId}
        })
        const createrId = ticket.Creates[0].id
        if ( performance.performanceStatus === `DONE`){
            res.status(400).send("공연 기간이 지난 티켓은 사용이 불가능합니다.")
        }
        // 타인 소유인 티켓 사용 안됨
        else if( req.user.id !== ticket.OwnerId){
            res.status(400).send(" 자기 티켓을 구매할 수 없습니다.")
        }
        // 자기가 발행한 티켓 사용 안됨
        else if(req.user.id === createrId){
            res.status(400).send("발행자는 티켓을 구매할 수 없습니다.")
        }
        else{
            await Ticket.update({
                status: `USED`
            },{
                where: {id: req.params.ticketId}
            })

            res.status(200).send("티켓을 사용합니다.")
        }
    }
    catch (e) {
        console.error(e)
        next(e)
    }
})


module.exports = router