const express = require(`express`)

const { Performance } = require(`../models`)


const router = express.Router()

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

module.exports = router