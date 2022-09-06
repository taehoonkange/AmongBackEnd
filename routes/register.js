const express = require(`express`)

const { User, Community, Communitystatus } = require(`../models`)
const {isLoggedIn} = require("./middlewares");

const router = express.Router()

// 인플루언서 등록

// 인플루언서로 변경
router.patch(`/`, isLoggedIn, async (req, res, next) => {
    /* 	#swagger.tags = ['Register']
     #swagger.summary = `인플루언서로 변경`
     #swagger.description = '인플루언서로 변경'
     */
    try{
        console.log(req.user.toJSON())
        if(req.user.userType === "INFLUENCER"){
            res.status(401).send("이미 인플루언서로 등록이 되어있습니다.")
        }
        else{
            const updateUser = await User.update({
                userType : `INFLUENCER`
            },
                {where: { id: req.user.id}})

            const community = await Community.create({
                head : req.user.id
            })

            await Communitystatus.create({
                status: `INFLUENCER`,
                UserId : req.user.id,
                CommunityId: community.id
            })


            res.status(200).json(updateUser)
        }
    }


    catch (e){
        console.error(e)
        next(e)
    }
})

module.exports = router