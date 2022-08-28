const express = require(`express`)

const { Comment, User, Post, Refcomment } = require(`../models`)

const {isLoggedIn} = require("./middlewares");

const router = express.Router()

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

// 게시물 상세 조회
router.get('/:postId', async (req, res, next) => {
    try {
        //좋아요 갯수 세기
        let like= 0
        const ps = await Post.findOne()
        ps.getLikes(ps.id).map((v)=> { like += 1});
        console.log(`${like}`)

        const post = await Post.findOne({
            where: { id: req.params.postId },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    order: [['createdAt', 'DESC']],
                }],
            }, {
                model: User, // 좋아요 누른 사람
                as: 'Likers',
                attributes: ['id'],
            }, {
                like: `${like}`
            }],
        });
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        next(error);
    }
});


//게시물 생성

router.post('/post', isLoggedIn, upload.none(), async (req, res, next) => { // POST /post
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
});

// 게시물  조회
router.get('/posts', async (req, res, next) => { // GET /posts
    try {
        const where = {};
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        const posts = await Post.findAll({
            where,
            limit: 10,
            order: [
                ['createdAt', 'DESC'],
                [Comment, 'createdAt', 'DESC'],
            ],
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: Comment,
                as: `RefferedComment`,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }]
            }, {
                model: Comment,
                as: `RefferingComment`,
                include: [{
                    model: User,
                    attributes: [`id`, `nickname`]
                }]
            }, {
                model: User, // 좋아요 누른 사람
                as: 'Likers',
                attributes: ['id'],
            }],
        });
        console.log(posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시물 상세 조회 + 댓글 같이 보게 하

router.get('/post/:postId', async ( req, res, next) =>{
    /* 	#swagger.tags = ['Board']
        #swagger.summary = `게시물 상세 조회`
        #swagger.description = '게시물 상세 조회'
        #swagger.parameters[`id`] = {
            in: parameters,
        }
        */
    try {
        // 게시물 상세 조회
        const post = await Post.findOne({
            where: { id: req.params.postId },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    order: [['createdAt', 'DESC']],
                }],
            }, {
                model: Refcomment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    order: [['createdAt', 'DESC']],
                }],
            },
                {
                model: User, // 좋아요 누른 사람
                as: 'Likers',
                attributes: ['id'],
            }],
        });

        if(post){

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
                    }, {
                        model: Comment,
                        order: [
                            ['createdAt', 'DESC'],
                            [ 'id', 'ASC']
                        ]
                    }]
            })

            res.status(200).json(fullPost)
        }
        else{
            res.status(403).send("게시물이 존재하지 않습니다.")
        }

    } catch (error){
        console.error(error)
        next(error)
    }
})

// 게시물 수정
router.patch(`/post/:Postid`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Post']
        #swagger.summary = `게시물 정보 저장`
        #swagger.description = '게시물 정보 저장'
        #swagger.parameters['post'] = {
            in: 'body',
            description: '게시물 예',
            schema: {
                $title: "제목 입력",
                $content: "내용 입력",
                $image: "example.png"
            }
        }
        */
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const post = await Post.update({
            where: { id: parseInt(req.params.Postid, 10)},
            content: req.body.content
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
    /* 	#swagger.tags = ['Comment']
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
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { // POST /post/1/comment
    /* 	#swagger.tags = ['Community']
       #swagger.summary = `대댓글 생성`
       #swagger.description = '대댓글 생성'
       #swagger.parameters = {
           in: body,
           description: `대댓글`
           ,
           schema: {
               $content: "대댓글 내용 입력",
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
        const comment = await Refcomment.create({
            content: req.body.content,
            PostId: parseInt(req.params.postId, 10),
            UserId: req.user.id,

        })
        const fullComment = await Refcomment.findOne({
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

//좋아요
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
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


router.post(`/refcomment/:id`, isLoggedIn,  async (req, res, next) => {
    /* 	#swagger.tags = ['Comment']
        #swagger.summary = `대댓글 생성`
        #swagger.description = '대댓글 생성'
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
        const comment = await Comment.create({
            content: req.body.content,
            PostId: req.params.id,
            UserId: req.user.id
        })

        const fullComment = await  Comment.update({
            where: {id: comment.id},
            include: {
                model: User,
                attributes: [ `nickname`]
            }
        })

        res.status(201).json(fullComment)
    } catch(err){
        console.error(err)
        next(err)
    }
} )
// 댓글 수정

router.patch(`/comment/:CommentId`, isLoggedIn, async (req, res, next) =>{
    try{
        const comment = await Comment.update({
            where : { id: req.params.CommentId },
            content: req.body.content,
        })

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

// 대댓글 수정

router.patch(`/refcomment/:RefcommentId`, isLoggedIn, async (req, res, next) =>{
    try{
        const comment = await Comment.update({
            where : { Refs: parseInt(req.params.RefcommentId, 10) },
            content: req.body.content,
        })

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
    try{
        Comment.destroy({
            where: {
                [Op.or]:
                    [{id: parseInt(req.params.Commentid, 10)},
                        {Refs: parseInt(req.params.Commentid, 10)}]
            }
        });

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
    #swagger.parameters[`image`] = {
        in: 'params',
        type: 'file',
        description: '프로필 사진 주소'
    }*/
    try{
        Comment.destroy({
            Refs: parseInt(req.params.Refcommentid, 10)
        });
    }
    catch (e) {
        console.error(e);
        next(e);
    }
})






module.exports = router