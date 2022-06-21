const mockCma: any = {
  entry: {
    get: jest.fn().mockReturnValue({
      sys: { contentType: { sys: { id: "page" } } },
    }),
    getMany: jest.fn().mockResolvedValue({
      items: [],
    }),
  },
};

export { mockCma };
