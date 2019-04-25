module.exports = {
  get: jest.fn(() => Promise.resolve({data: {}})),
}

// Note:
// For now we don't need any other method (POST/PUT/PATCH), what we have already works fine.
// We will add more methods only if we need to.
// For reference please read: https://github.com/testing-library/react-testing-library/issues/2
