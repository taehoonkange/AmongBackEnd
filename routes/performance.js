const express = require(`express`)

const { Performance } = require(`../models`)

const { isLoggedIn } = require(`./middlewares`)
const router = express.Router()

// 티켓 생성

router.post(`/`, isLoggedIn, async (req, res, next) => {
    try{
        const performance = await Performance.create({
            title: req.body.title,
            place: req.body.place,
            time: req.body.time,
            term_start_at: req.body.term_start_at,
            term_end_at: req.body.term_end_at,
            start_at: req.body.start_at,
            end_at: req.body.end_at,
            description: req.body.description,
            img_src: req.body.img_src
        })
        res.status(200).json(performance)
    } catch(err){
        console.error(err)
        next(err)
    }
} )
// 공연 상세 정보 보기

router.get(`/:id`,  async (req, res, next) => {
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