import app from "./app.js"


const PORT = process.env.PORT||5000;

process.on("uncaughtException",(err)=>{
    console.error("uncaughtException",err);
    process.exit(1);
})

const server = app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on("unhandledRejection",(reason)=>{
    console.error("UnhandledRejection",reason);
    server.close(()=>{
        process.exit(1);
    });
})