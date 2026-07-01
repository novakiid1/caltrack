import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../app.js';
import { clearDB, setupDB, teardownDB } from '../helpers/db.js';

describe('Auth routes', () => {
    beforeAll(setupDB);
    afterAll(teardownDB);
    beforeEach(clearDB);

    describe('GET /register', () => {
        it('renders register page', async () => {
            const res = await request(app).get('/register');
            expect(res.status).toBe(200);
            expect(res.text).toContain('create your account');
        });
    });

    describe('POST /register', () => {
        it('creates user and redirects to /setup', async () => {
            const res = await request(app)
                .post('/register')
                .type('form')
                .send({ name: 'Test', email: 'test@test.com', password: 'pass123' });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/setup');
        });

        it('rejects duplicate email', async () => {
            await request(app).post('/register').type('form').send({ name: 'A', email: 'dup@test.com', password: 'pw' });
            const res = await request(app)
                .post('/register')
                .type('form')
                .send({ name: 'B', email: 'dup@test.com', password: 'pw' });
            expect(res.status).toBe(200);
            expect(res.text).toContain('email already in use');
        });

        it('sets a session cookie', async () => {
            const res = await request(app)
                .post('/register')
                .type('form')
                .send({ name: 'Test', email: 'test@test.com', password: 'pass123' });
            expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    describe('GET /login', () => {
        it('renders login page', async () => {
            const res = await request(app).get('/login');
            expect(res.status).toBe(200);
            expect(res.text).toContain('log in');
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            await request(app).post('/register').type('form').send({ name: 'User', email: 'u@t.com', password: 'pw' });
        });

        it('valid credentials redirect to /home', async () => {
            const res = await request(app)
                .post('/login')
                .type('form')
                .send({ email: 'u@t.com', password: 'pw' });
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/home');
        });

        it('wrong password returns error', async () => {
            const res = await request(app)
                .post('/login')
                .type('form')
                .send({ email: 'u@t.com', password: 'wrongpass' });
            expect(res.status).toBe(200);
            expect(res.text).toContain('invalid email or password');
        });

        it('unknown email returns error', async () => {
            const res = await request(app)
                .post('/login')
                .type('form')
                .send({ email: 'nobody@test.com', password: 'pw' });
            expect(res.status).toBe(200);
            expect(res.text).toContain('invalid email or password');
        });
    });

    describe('GET /logout', () => {
        it('redirects to /login', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'U', email: 'u@t.com', password: 'pw' });
            const res = await agent.get('/logout');
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
        });

        it('invalidates session — /home redirects to /login afterwards', async () => {
            const agent = request.agent(app);
            await agent.post('/register').type('form').send({ name: 'U', email: 'u@t.com', password: 'pw' });
            await agent.get('/logout');
            const res = await agent.get('/home');
            expect(res.headers.location).toBe('/login');
        });
    });
});