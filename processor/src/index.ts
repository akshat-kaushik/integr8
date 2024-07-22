import {PrismaClient} from '@prisma/client';
import {Kafka} from 'kafkajs';

const client= new PrismaClient();

const TOPIC_NAME="task-event"

const kafka=new Kafka({
    clientId: 'processor',
    brokers: ['localhost:9092']
})
async function main(){

    const producer=kafka.producer();
    await producer.connect();

    while(true){
        const pending=await client.taskRunOutbox.findMany({
            where  :{},
            take: 10
        })

        producer.send({
            topic: TOPIC_NAME,
            messages: pending.map(p=>({
                key: p.id,
                value: p.taskRunId
            }))
        })
        await client.taskRunOutbox.deleteMany({
            where:{
                id:{
                    in: pending.map(p=>p.id)
                }
            }
        })
}
}

main()