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
            description: '전체 공연 API',
        },
        {
            name: 'Ticket',
            description: '티켓 API',
        },

    ],
    host: "localhost:3065",
    schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(async ()=>{
       await import(`../app.js`)
})
