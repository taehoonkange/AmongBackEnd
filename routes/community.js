const express = require(`express`)
const { Op } = require(`sequelize`)
const { Comment, User, Post, Image } = require(`../models`)
const multer = require(`multer`)
const path = require(`path`)
const fs = require(`fs`)
const {isLoggedIn} = require("./middlewares");

const router = express.Router()


try {
    fs.accessSync(`uploads`)
} catch (err){
    console.log(`uploads 폴더가  없으므로 생성합니다.`)
    fs.mkdirSync(`uploads`);
}

//업로드 메소드
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, `uploads`);
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname)
            const decodedFileName =decodeURIComponent(file.originalname)
            const basename = path.basename(decodedFileName, ext)
            done(null, basename + `_`+ new Date().getTime() + ext);
        }
    }),
    limit: { fileSize: 20 * 1024 * 1024 }
})

//게시물 사진 저장

router.post('/images', isLoggedIn, upload.array('image'), (req, res) => { // POST /post/images
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `게시물 사진 저장`
    #swagger.description = '게시물 사진 저장'
    #swagger.parameters[`image`] = {
        in: 'formData',
        type: 'file',
        description: '프로필 사진 주소'
    }*/
    console.log(req.files);
    res.json(req.files.map((v) => v.filename));
});
//게시물 생성

router.post('/post', isLoggedIn, upload.none(), async (req, res, next) => { // POST /post
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `게시물 생성`
    #swagger.description = '게시물 생성'
    #swagger.parameters[`Post`] = {
        in: 'body',
        description: '게시물 생성',
        schema: { $ref: "#/definitions/Post"}

    }*/
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const post = await Post.create({
            content: req.body.content,
            UserId: req.user.id,
        });
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            }))); // [[노드, true], [리액트, true]]
            await post.addHashtags(result.map((v) => v[0]));
        }
        if (req.body.image) {
            if (Array.isArray(req.body.image)) { // 이미지를 여러 개 올리면 image: [제로초.png, 부기초.png]
                const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
                await post.addImages(images);
            } else { // 이미지를 하나만 올리면 image: 제로초.png
                const image = await Image.create({ src: req.body.image });
                await post.addImages(image);
            }
        }
        const fullPost =
            (req.body.image?
                await Post.findOne({
                    where: { id: post.id },
                    include: [
                        {
                            model: Image,
                        },
                        {
                            model: User, // 게시글 작성자
                            attributes: ['id', 'nickname'],
                        }]
                }):
                await Post.findOne({
                    where: { id: post.id },
                    include: [
                        {
                            model: User, // 게시글 작성자
                            attributes: ['id', 'nickname'],
                        }]
                }))

        res.status(201).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시물 상세 조회
router.get('/post/:postId', async (req, res, next) =>{
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `게시물 상세 조회`
    #swagger.description = '게시물 상세 조회'
   */

    try {
        //좋아요 갯수 세기
        // let like_count= 0
        // const liked_post = await Post.findOne({
        //     where: {id : req.params.postId}
        // })
        // const liked = await liked_post.getLikers()
        // // map을 사용하기위해 string -> json 파일로 전환
        // const jsonData = JSON.stringify(liked)
        // const likes = JSON.parse(jsonData)
        // console.log(likes)
        // likes.map( like => {
        //     like_count += 1
        // })


        const post = await Post.findOne({
            where: { id: req.params.postId},
            order: [[Comment,'createdAt', 'DESC'],
            ],
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
                attributes: ['id', 'src'],
            },{
                model: Comment,
                attributes: ['id', 'content'],
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    include: [
                        {
                            model: Image,
                            attributes: ['id', 'src'],
                        }
                    ],
                }, {
                    model: Comment,
                    through: `Ref`,
                    as: `Refs`,
                    attributes: [`id`, `content`],
                    include: [{
                        model: User,
                        attributes: ['id', 'nickname']
                    }]}],},
                {
                    model: User, // 좋아요 누른 사람
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
        });
        res.status(200).json({post, "likeCount": post.Likers.length});
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// 게시물  조회
router.get('/posts/:lastId', async (req, res, next) => { // GET /
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `게시물 조회`
    #swagger.description = '게시물 조회'
    */
    try {
        const where = {};
        if (parseInt(req.params.lastId, 10)) { // 초기 로딩이 아닐 때
            where.id = { [Op.lt]: parseInt(req.params.lastId, 10)}
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        const posts = await Post.findAll({
            where,
            limit: 10,
            order: [
                ['createdAt', 'DESC'],
                [Comment, 'createdAt', 'DESC'],
            ],
            attributes: {
                exclude: [`UserId`]
            },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
                attributes: [`id`, `src`]
            }, {
                model: Comment,
                attributes: ['id', 'content'],
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    include: [
                        {
                            model: Image,
                            attributes: ['id', 'src'],
                        }
                    ],
                }, {
                    model: Comment,
                    through: `Ref`,
                    as: `Refs`,
                    attributes: [`id`, `content`],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'nickname']
                        }
                        ]
                }
                ],

            }, {
                model: User, // 좋아요 누른 사람
                as: 'Likers',
                attributes: ['id'],
            }],
        })
        const FullPosts = posts.map( post => {
            return {post, "likeCount": post.Likers.length}
        })
        res.status(200).json(FullPosts);
    } catch (error) {
        console.error(error);
        next(error);xw
    }
});

// 게시물 수정
router.patch(`/post/:Postid`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Community']
        #swagger.summary = `게시물 수정`
        #swagger.description = '게시물 수정'
        #swagger.parameters['post'] = {
            in: 'body',
            description: '게시물 예',
            schema: {
                $content: "내용 입력",
                $image: "example.png"
            }
        }
        */
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        await Post.update({
            content: req.body.content
        }, {where: { id: parseInt(req.params.Postid, 10)}});
        const post = await Post.findOne({
            where: { id: parseInt(req.params.Postid, 10)}
        })
        const images =  await Image.findAll({
            where: {PostId: post.id}
        })

        images.map( async (img) => {
                await Image.update({
                    PostId: null
                }, {where : {id: img.id}})
            }
        )
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() },
            }))); // [[노드, true], [리액트, true]]
            await post.addHashtags(result.map((v) => v[0]));
        }
        if (req.body.image) {
            if (Array.isArray(req.body.image)) { // 이미지를 여러 개 올리면 image: [제로초.png, 부기초.png]
                const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
                await post.addImages(images);
            } else { // 이미지를 하나만 올리면 image: 제로초.png
                const image = await Image.create({ src: req.body.image });
                await post.addImages(image);
            }
        }
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [{
                model: Image,
            },
                {
                    model: User, // 게시글 작성자
                    attributes: ['id', 'nickname'],
                }, {
                    model: User, // 좋아요 누른 사람
                    as: 'Likers',
                    attributes: ['id'],
                }]
        })
        res.status(201).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
} )
// 게시물 삭제

router.delete('/:postId', isLoggedIn, async (req, res, next) => { // DELETE /post/10
    /* 	#swagger.tags = ['Community']
        #swagger.summary = `게시물 삭제`
        #swagger.description = '게시물 삭제'

        */
    try {
        await Post.destroy({
            where: {
                id: req.params.postId,
                UserId: req.user.id,
            },
        });
        res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});



// 댓글 생성
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { // POST /post/1/comment
    /* 	#swagger.tags = ['Community']
       #swagger.summary = `댓글 생성`
       #swagger.description = '댓글 생성'
       #swagger.parameters = {
           in: body,
           description: `댓글`
           ,
           schema: {
               $content: "댓글 내용 입력",
           }
       }
       */
    try {
        const post = await Post.findOne({
            where: { id: req.params.postId },
        });
        if (!post) {
            return res.status(403).send('존재하지 않는 게시글입니다.');
        }
        const comment = await Comment.create({
            content: req.body.content,
            PostId: parseInt(req.params.postId, 10),
            UserId: req.user.id,
        })
        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }],
        })
        res.status(201).json(fullComment);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 대댓글 생성
router.post('/:refId/:PostId/refcomment', isLoggedIn, async (req, res, next) => { // POST /post/1/comment
    /* 	#swagger.tags = ['Community']
       #swagger.summary = `대댓글 생성`
       #swagger.description = '대댓글 생성'
       #swagger.parameters[`body`] = {
           in: body,
           description: `대댓글 내용 입력`
           schema: {
           $content: "대댓글 내용 입력"
           }
       }
       */
    try {
        const comment = await Comment.findOne({
            where : { id: req.params.refId}
        })
        const ref_comment = await Comment.create({
            content: req.body.content,
            CommentId: parseInt(req.params.refId, 10),
            UserId: req.user.id

        })
        await comment.addRefs(ref_comment.id)
        const FullRefComment = await Comment.findOne({
            where : { id: ref_comment.id}
        })
        res.status(201).json(FullRefComment);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

//좋아요
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `좋아요`
    #swagger.description = '좋아요'
         }*/
    try {
        const post = await Post.findOne({ where: { id: req.params.postId }});
        if (!post)  {
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }
        await post.addLikers(req.user.id);
        res.json({ PostId: post.id, UserId: req.user.id });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

//좋아요 삭제
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => { // DELETE /post/1/like
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `좋아요 삭제`
    #swagger.description = '좋아요 삭제'
         }*/
    try {
        const post = await Post.findOne({ where: { id: req.params.postId }});
        if (!post) {
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }
        await post.removeLikers(req.user.id);
        res.json({ PostId: post.id, UserId: req.user.id });
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// 댓글 수정

router.patch(`/comment/:CommentId`, isLoggedIn, async (req, res, next) =>{
    /* 	#swagger.tags = ['Community']
        #swagger.summary = `댓글 수정`
        #swagger.description = '댓글 수정'
        #swagger.parameters = {
            in: body,
            description: `대댓글`
            ,
            schema: {
                $content: "대댓글 내용 입력"

            }
        }
        */
    try{
        const comment = await Comment.update({
            content: req.body.content,
        }, {where : { id: req.params.CommentId },})

        if(comment){
            res.status(200).json(comment);
        }
        else{
            res.status(403).send(`없는 대댓글입니다.`)
        }
    }
    catch (e){
        console.error(e)
        next(e)
    }
})


// 댓글 삭제

router.delete(`/comment/:Commentid`, isLoggedIn, async(req, res, next) => {
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `댓글 삭제`
    #swagger.description = '댓글 삭제'
    */
    try{
        Comment.destroy({
            where: {id: parseInt(req.params.Commentid, 10)}

        });
        res.status(200).send("댓글이 삭제 되었습니다.")
    }
    catch (e) {
        console.error(e);
        next(e);
    }
})

// 대댓글 삭제

router.delete(`/refcomment/:Refcommentid`, isLoggedIn, async(req, res, next) => {
    /* 	#swagger.tags = ['Community']
    #swagger.summary = `대댓글 삭제`
    #swagger.description = '대댓글 삭제'

         }*/
    try{
        Comment.destroy({
            where: {id: parseInt(req.params.Refcommentid, 10)}
        });
        res.status(200).send("대댓글이 삭제 되었습니다.")
    }
    catch (e) {
        console.error(e);
        next(e);
    }
})






module.exports = router