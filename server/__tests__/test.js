const chai = require('chai');
const chaiHttp = require('chai-http');
// const { generateText, getSubtopics, explainTopic, evaluateResponse } = require('../controllers/promptController');
const app = require("../src/app");
const expect = chai.expect;

chai.use(chaiHttp);

describe('Controller tests', () => {
  describe('getSubtopics()', () => {
    it('should return an array of subtopics', async () => {
      const res = await chai.request(app)
        .post('api/prompt/topics')
        .send({ subject: 'history' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('data').to.be.an('array');
      expect(res.body.status).to.equal('Success');
    });
  });

  describe('explainTopic()', () => {
    it('should return a string description of the topic', async () => {
      const res = await chai.request(app)
        .post('api/prompt/explain')
        .send({ topic: 'quantum physics' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('data').to.be.a('string');
      expect(res.body.status).to.equal('Success');
    });
  });

  describe('evaluateResponse()', () => {
    it('should return whether the response is apt or not', async () => {
      const res = await chai.request(app)
        .post('api/prompt/evaluate')
        .send({ user_response: 'This is a good description.', topic: 'history' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('data').to.be.a('string');
      expect(res.body).to.have.property('passed').to.be.a('boolean');
      expect(res.body.status).to.equal('Success');
    });
  });

});
