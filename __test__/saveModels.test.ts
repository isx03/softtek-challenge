import { saveModels } from '../functions/saveModels';
import { ddbDocClient } from '../config/db';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';

jest.mock('../config/db', () => ({
  ddbDocClient: {
    send: jest.fn(),
  },
}));

const mockAxios = new MockAdapter(axios);

describe('saveModels Lambda', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should save model and return the translated data', async () => {
    const mockApiResponse = { name: 'Luke Skywalker', gender: 'male' };
    mockAxios.onGet('https://swapi.py4e.com/api/people/1').reply(200, mockApiResponse);

    const body = { type: 'people', id: 1 };
    const event = { body: JSON.stringify(body) };

    const mockTranslatedModel = {
      id: 'people-1',
      nombre: 'Luke Skywalker',
      'género': 'male',
    };
    (ddbDocClient.send as jest.Mock).mockResolvedValue({});

    const result = await saveModels(event as any);

    expect(result.statusCode).toBe(StatusCodes.CREATED);
    expect(JSON.parse(result.body)).toEqual(mockTranslatedModel);
  });

  it('should return error if SWAPI fails', async () => {
    const body = { type: 'people', id: 1 };
    const event = { body: JSON.stringify(body) };

    mockAxios.onGet('https://swapi.py4e.com/api/people/1').reply(500);

    const result = await saveModels(event as any);

    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.body).toBe('Not found');
  });

  it('should return error if DynamoDB fails', async () => {
    const body = { type: 'people', id: 1 };
    const event = { body: JSON.stringify(body) };

    const mockApiResponse = { name: 'Luke Skywalker', gender: 'male' };
    mockAxios.onGet(`https://swapi.py4e.com/api/${body.type}/${body.id}`).reply(200, mockApiResponse);

    (ddbDocClient.send as jest.Mock).mockRejectedValue({ status: 500, statusText: 'DynamoDB error' });

    const result = await saveModels(event as any);

    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.body).toBe('DynamoDB error');
  });
});