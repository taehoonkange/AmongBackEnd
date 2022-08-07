const express = require(`express`)

const { Ticket } = require(`../models`)

const router = express.Router()

// 티켓 상세 정보 보기

router.get(`/:id`,  async (req, res, next) => {
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

module.exports = router