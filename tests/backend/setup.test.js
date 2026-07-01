import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { userModel } from '../../models/users.js';
import { setupDB, teardownDB, clearDB } from '../helpers/db.js';

describe('Setup routes', () => {
    beforeAll(setupDB);
    afterAll(teardownDB);
    beforeEach(clearDB);

    describe('GET /setup', () => {
        it('redirects to /login if unauthenticated', async () => {
            const res = await request(app).get('/setup');
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
        });

        it('renders setup form for authenticated user', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
            const res = await agent.get('/setup');
            expect(res.status).toBe(200);
            expect(res.text).toContain('set your daily goals');
        });

        it('greets user by name', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Alice', email: 't@t.com', password: 'pw' });
            const res = await agent.get('/setup');
            expect(res.text).toContain('Alice');
        });
//seperate out the tests into setup goals and display saved goals
        it('pre-fills goals if already saved', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
            await agent.post('/setup').type('form').send({ calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 });
            const res = await agent.get('/setup');
            expect(res.text).toContain('2000');
            expect(res.text).toContain('150');
        });
    });

    describe('POST /setup', () => {
        it('saves goals and redirects to /home', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
            const res = await agent
                .post('/setup')
                .type('form')
                .send({ calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/home');
        });

        it('persists all goal values in DB', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
            await agent.post('/setup').type('form').send({ calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 });
            const user = await userModel.findOne({ email: 't@t.com' });
            expect(user.goals.calories).toBe(2000);
            expect(user.goals.protein).toBe(150);
            expect(user.goals.carbs).toBe(250);
            expect(user.goals.fats).toBe(65);
            expect(user.goals.fibre).toBe(30);
        });

        it('redirects to /login if unauthenticated', async () => {
            const res = await request(app)
                .post('/setup')
                .type('form')
                .send({ calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
        });
    });
});
