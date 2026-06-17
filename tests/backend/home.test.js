import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { userMealModel } from '../../models/users.js';
import { setupDB, teardownDB, clearDB, seedFoodItems } from '../helpers/db.js';

async function createAuthedAgent() {
    const agent = request.agent(app);
    await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
    await agent.post('/setup').type('form').send({ calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 });
    return agent;
}

describe('Home routes', () => {
    beforeAll(setupDB);
    afterAll(teardownDB);
    beforeEach(async () => { await clearDB(); await seedFoodItems(); });

    describe('GET /home', () => {
        it('redirects to /login if unauthenticated', async () => {
            const res = await request(app).get('/home');
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
        });

        it('redirects to /setup if no goals set', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'Test', email: 't@t.com', password: 'pw' });
            const res = await agent.get('/home');
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/setup');
        });

        it('renders home page with daily summary section', async () => {
            const agent = await createAuthedAgent();
            const res = await agent.get('/home');
            expect(res.status).toBe(200);
            expect(res.text).toContain("today's summary");
        });

        it('shows empty state when no meals logged today', async () => {
            const agent = await createAuthedAgent();
            const res = await agent.get('/home');
            expect(res.text).toContain('no meals logged today');
        });

        it('shows all meals logged today', async () => {
            const agent = await createAuthedAgent();
            for (let i = 0; i < 5; i++) {
                await agent.post('/home').type('form')
                    .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });
            }
            const res = await agent.get('/home');
            // all 5 meals for today are shown (no limit on daily view)
            const count = (res.text.match(/class="meal-card"/g) || []).length;
            expect(count).toBe(5);
        });
    });

    describe('POST /home', () => {
        it('creates a meal and redirects', async () => {
            const agent = await createAuthedAgent();
            const res = await agent
                .post('/home')
                .type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/home');
        });

        it('saves meal inside today\'s day document', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'dinner' });

            const dayDoc = await userMealModel.findOne({});
            expect(dayDoc).toBeTruthy();
            expect(dayDoc.meals).toHaveLength(1);
            expect(dayDoc.meals[0].mealtype).toBe('dinner');
            expect(dayDoc.meals[0].totals.calories).toBeCloseTo(200); // 2 * 100
        });

        it('appends subsequent meals to the same day document', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'breakfast' });
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'rice', 'quantity[]': '200', mealtype: 'lunch' });

            const dayDoc = await userMealModel.findOne({});
            expect(dayDoc.meals).toHaveLength(2);
        });

        it('daily totals aggregate across all meals of the day', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'breakfast' });
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'rice', 'quantity[]': '100', mealtype: 'lunch' });

            const dayDoc = await userMealModel.findOne({});
            // chicken: 2*100=200, rice: 1.3*100=130 → daily: 330
            expect(dayDoc.dailyTotals.calories).toBeCloseTo(330);
        });

        it('saves multiple food items in one meal', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send('fooditem[]=chicken&quantity[]=100&fooditem[]=rice&quantity[]=200&mealtype=lunch');

            const dayDoc = await userMealModel.findOne({});
            expect(dayDoc.meals[0].mealItems).toHaveLength(2);
        });

        it('only saves meals for the logged-in user', async () => {
            const agentA = await createAuthedAgent();
            await agentA.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });

            const agentB = request.agent(app);
            await agentB.post('/register').type('form').send({ name: 'B', email: 'b@t.com', password: 'pw' });
            await agentB.post('/setup').type('form').send({ calories: 1800, protein: 120, carbs: 200, fats: 60, fibre: 25 });
            const res = await agentB.get('/home');
            expect(res.text).toContain('no meals logged today');
        });

        it('returns 500 for unknown food item', async () => {
            const agent = await createAuthedAgent();
            const res = await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'xyz_unknown', 'quantity[]': '100', mealtype: 'snack' });
            expect(res.status).toBe(500);
        });

        it('redirects to /login if unauthenticated', async () => {
            const res = await request(app).post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
        });
    });
});
