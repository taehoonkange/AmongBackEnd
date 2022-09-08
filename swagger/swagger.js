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
            name: 'Community',
            description: '게시물 API',
        },

        {
            name: 'TicketBook',
            description: '티켓북 API',
        }

    ],
    host: "localhost:3065",
    schemes: ["http"],
    definitions: {
        Performance: {
            title: "행사 제목 입력",
            place: "행사 장소 입력",
            time: "행사 시간",
            limitedAge: "제한된 나이",
            term_start_at: "YYYY-MM-DD HH:MM:SS",
            term_end_at: "YYYY-MM-DD HH:MM:SS",
            start_at: "YYYY-MM-DD HH:MM:SS",
            end_at: "YYYY-MM-DD HH:MM:SS",
            description: "행사 상세 설명",
            infos: [{class: "좌석 등급", price: "좌석 가격", number: "좌석 갯수"},],
            image: "이미지"
        },

        Post: {
            content: "게시물 내용 입력",
            image: ["이미지 주소 입력", "", ],
            limitedReader: "VIP"
        }
    }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(async ()=>{
       await import(`../app.js`)
})
