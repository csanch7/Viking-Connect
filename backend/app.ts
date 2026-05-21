import express from 'express';
import {Request, Response} from 'express';
const app = express();

import { neon } from '@neondatabase/serverless';
const database_url : string = process.env.DATABASE_URL ?? ""
const sql = neon(database_url);


app.get('/', async (req: Request, res: Response) => {
    const organizations = await sql`SELECT * FROM organizations`;
    res.send(organizations);
});
app.listen(3000, () => console.log('server started'));
