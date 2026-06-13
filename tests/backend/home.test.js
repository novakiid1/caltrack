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

        it('renders home page for authenticated user with goals', async () => {
            const agent = await createAuthedAgent();
            const res = await agent.get('/home');
            expect(res.status).toBe(200);
            expect(res.text).toContain('your meals');
        });

        it('shows empty state when no meals exist', async () => {
            const agent = await createAuthedAgent();
            const res = await agent.get('/home');
            expect(res.text).toContain('no meals logged yet');
        });

        it('limits display to 4 meals maximum', async () => {
            const agent = await createAuthedAgent();
            for (let i = 0; i < 5; i++) {
                await agent.post('/home').type('form')
                    .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });
            }
            const res = await agent.get('/home');
            const count = (res.text.match(/class="meal-card"/g) || []).length;
            expect(count).toBe(4);
        });
    });

    describe('POST /home', () => {
        it('creates a meal and redirects to /home', async () => {
            const agent = await createAuthedAgent();
            const res = await agent
                .post('/home')
                .type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/home');
        });

        it('saves meal with correct totals', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'dinner' });
            const meal = await userMealModel.findOne({ mealtype: 'dinner' });
            expect(meal).toBeTruthy();
            expect(meal.totals.calories).toBeCloseTo(200); // 2 * 100
            expect(meal.mealtype).toBe('dinner');
        });

        it('saves multiple food items in one meal', async () => {
            const agent = await createAuthedAgent();
            await agent.post('/home')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send('fooditem[]=chicken&quantity[]=100&fooditem[]=rice&quantity[]=200&mealtype=lunch');
            const meal = await userMealModel.findOne({ mealtype: 'lunch' });
            expect(meal.mealItems).toHaveLength(2);
        });

        it('only saves meals for the logged-in user', async () => {
            const agentA = await createAuthedAgent();
            await agentA.post('/home').type('form')
                .send({ 'fooditem[]': 'chicken', 'quantity[]': '100', mealtype: 'lunch' });

            const agentB = request.agent(app);
            await agentB.post('/register').type('form').send({ name: 'B', email: 'b@t.com', password: 'pw' });
            await agentB.post('/setup').type('form').send({ calories: 1800, protein: 120, carbs: 200, fats: 60, fibre: 25 });
            const res = await agentB.get('/home');
            expect(res.text).toContain('no meals logged yet');
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
