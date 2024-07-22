import express from 'express';
import { PrismaClient } from '@prisma/client';
const app=express();

app.use(express.json())

const client=new PrismaClient

app.post("/hooks/catch/:usedId/:taskId",async (req,res)=>{
    const userId=req.params.usedId
    const taskId=req.params.taskId
    const metadata=req.body

    await client.$transaction(async tx=>{
        const run=await tx.taskRun.create({
            data:{
                taskId:taskId,
                metadata:metadata
            }
        })
        await tx.taskRunOutbox.create({
            data:{
                taskRunId:run.id
            }
        })
    })

    res.json({
        message:"webhook hooked on lund"
    })
})
console.log("running")

app.listen(3000)
