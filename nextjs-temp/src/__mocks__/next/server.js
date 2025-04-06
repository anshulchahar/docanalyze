// Mock implementation for next/server
export class NextRequest {
  constructor(input, init = {}) {
    this.headers = new Headers(init.headers || {});
    this.method = init.method || 'GET';
    this.url = input.toString();
    this.formData = jest.fn().mockResolvedValue({});
  }
}

export class NextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Headers(init.headers || {});
  }

  static json(data, init = {}) {
    const body = JSON.stringify(data);
    const response = new NextResponse(body, init);
    response.headers.set('content-type', 'application/json');
    return response;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Mock implementations for other Next.js server utilities
export const cookies = () => ({
  get: jest.fn(),
  set: jest.fn(),
  getAll: jest.fn().mockReturnValue([]),
});

export const headers = () => ({
  get: jest.fn(),
  set: jest.fn(),
  getAll: jest.fn().mockReturnValue([]),
});