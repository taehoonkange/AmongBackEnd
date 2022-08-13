const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "AMONG API",
        description: "Description",
    },
    tags: [
        {
            name: 'User',
            description: '유저 API',
        },
        {
            name: 'Performance',
            description: '공연 API',
        },
        {
            name: 'Performances',
            description: '모든 공연 API',
        },
        {
            name: 'Board',
            description: '게시물 API',
        },
        {
            name: 'Ticket',
            description: '티켓 API',
        }

    ],
    host: "localhost:3065",
    schemes: ["http"],
    definitions: {
        Performance: {
            title: "공연 제목 입력",
            place: "공연 장소 입력",
            time: "공연 시간",
            term_start_at: "YYYY-MM-DD HH:MM:SS",
            term_end_at: "YYYY-MM-DD HH:MM:SS",
            start_at: "YYYY-MM-DD HH:MM:SS",
            end_at: "YYYY-MM-DD HH:MM:SS",
            description: "공연 상세 설명",
            infos: [{class: "좌석 등급", price: "좌석 가격", number: "좌석 갯수"},],
            allow_resale: "true or false"
        }
    }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(async ()=>{
       await import(`../app.js`)
})
