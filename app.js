const express = require(`express`)
const cors = require(`cors`)
const session = require(`express-session`)
const cookieParser = require(`cookie-parser`)
const passport = require(`passport`)
const morgan = require(`morgan`)
const path = require(`path`)
const dotenv = require(`dotenv`)
const logger = require(`./logger`)
const hpp = require('hpp');
const helmet = require('helmet');
const redis = require(`redis`);
const RedisStore = require(`connect-redis`)(session);

const userRouter = require(`./routes/user`)
const ticketRouter = require(`./routes/ticket`)
const performanceRouter = require(`./routes/performance`)
const communityRouter = require(`./routes/community`)
const influencerRouter = require(`./routes/influencer`)
const ticketbookRouter = require(`./routes/ticketbook`)


const db = require(`./models`)

const passportConfigure = require(`./passport`)

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output')

dotenv.config()

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
})
const app = express()


db.sequelize.sync({force: true})
    .then(() =>{
        console.log(`db 연결 성공`)
    })
    .catch(console.error)
passportConfigure()

if(process.env.NODE_ENV === `production`){
    app.use(morgan(`combined`))
    app.use(hpp());
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors({
        // frontserver address
        origin: [`http://localhost:3060`],
        credentials: true
    }))
}else{
    app.use(morgan(`dev`))
    app.use(cors({
        // frontserver address
        origin: true,
        credentials: true
    }))

}




app.use(`/`, express.static(path.join(__dirname, `uploads`)))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        // domain: process.env.NODE_ENV === `production` && `.amongapi.shop`
    },
    store: new RedisStore({client: redisClient})

}));


app.use(passport.initialize())
app.use(passport.session());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use(`/user`, userRouter)
app.use(`/performance`, performanceRouter)
app.use(`/ticket`, ticketRouter)
app.use(`/community`, communityRouter)
app.use(`/ticket`, ticketRouter)
app.use(`/influencer`, influencerRouter)
app.use(`/ticketbook`, ticketbookRouter)


app.use((req, res, next) =>{
    const error = new Error (`${req.method} ${req.url} 라우터가 없습니다.`)
    error.status = 404;
    logger.info(`hello`)
    logger.error(error.message);
    next(error)
});

app.get(`/`, (req, res) =>{
    res.send(`hello express`)
})
app.listen(3065, () =>{
    console.log(`서버 실행 중..`)
})
