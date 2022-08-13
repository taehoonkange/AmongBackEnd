const express = require(`express`)

const { Comment, User } = require(`../models`)

const {isLoggedIn} = require("./middlewares");

const router = express.Router()

// 댓글 생성

router.post(`/board/:BoardId`, isLoggedIn,  async (req, res, next) => {
    /* 	#swagger.tags = ['Comment']
        #swagger.summary = `댓글 생성`
        #swagger.description = '댓글 생성'
        #swagger.parameters = {
            in: body,
            description: `댓글`
            ,
            schema: {
                $content: "댓글 내용 입력",
                $ref: "true or false 입력"
            }
        }
        */
    try{
        const comment = await Comment.create({
            content: req.body.content,
            BoardId: req.params.BoardId,
            UserId: req.user.id
        })

        const fullComment = await  Comment.update({
            where: {id: comment.id},
            include: {
                model: User,
                attributes: [ `nickname`]
            }
        })

        if(JSON.parse(req.body.ref)){

        }

        res.status(201).json(comment)
    } catch(err){
        console.error(err)
        next(err)
    }
} )

// 대댓글 생성

// 댓글 조회

// 댓글 삭제

//
// 대댓글 생성

// 대댓글 조회





module.exports = router