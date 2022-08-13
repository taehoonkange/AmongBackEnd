const express = require(`express`)
const multer = require(`multer`)
const path = require(`path`)
const fs = require(`fs`)

const { Board } = require(`../models`)

const { isLoggedIn } = require(`./middlewares`)

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
router.post( `/image`, isLoggedIn, upload.single(`image`), async (req, res, next) => {
    /* 	#swagger.tags = ['Board']
    #swagger.summary = `게시물 사진 저장`
    #swagger.description = '게시물 사진 저장'
    #swagger.parameters[`image`] = {
        in: 'formData',
        type: 'file',
        description: '프로필 사진 주소'
    }*/
    console.log(req.file);
    res.json(req.file.filename)
})

//게시물 생성
router.post(`/`, isLoggedIn, upload.none(), async (req, res, next) => {
    /* 	#swagger.tags = ['Board']
        #swagger.summary = `게시물 정보 저장`
        #swagger.description = '게시물 정보 저장'
        #swagger.parameters['board'] = {
            in: 'body',
            description: '게시물 예',
            schema: {
                $title: "제목 입력",
                $content: "내용 입력",
                $image: "example.png"
            }
        }
        */
    try{
        // 게시물 db 생성
        const board = await Board.create({
            title: req.body.title,
            content: req.body.content
        })
        await board.update({
            img_src: req.body.image
        })
        res.status(201).json(board)
    } catch(err){
        console.error(err)
        next(err)
    }
} )

// 게시물 제목만 조회

router.get('/', async ( req, res, next) =>{
    /* 	#swagger.tags = ['Board']
        #swagger.summary = `게시물 제목만 조회`
        #swagger.description = '게시물 제목만 조히'

        */
    try {
        // 게시물 제목 조회
        const board = await Board.findOne({
            attributes: [ `title` ]
            }
        )
        if(board){

            res.status(200).json(board)
        }
        else{
            res.status(403).send("게시물이 존재하지 않습니다.")
        }

    } catch (error){
        console.error(error)
        next(error)
    }
})
// 게시물 상세 조회

router.get('/{id}', async ( req, res, next) =>{
    /* 	#swagger.tags = ['Board']
        #swagger.summary = `게시물 상세 조회`
        #swagger.description = '게시물 상세 조회'
        #swagger.parameters[`id`] = {
            in: parameters,

        }
        */
    try {
        // 게시물 상세 조회
        const board = await Board.findOne({
                where: { id: req.params.id }
            }
        )
        if(board){
            res.status(200).json(board)
        }
        else{
            res.status(403).send("게시물이 존재하지 않습니다.")
        }

    } catch (error){
        console.error(error)
        next(error)
    }
})


module.exports = router