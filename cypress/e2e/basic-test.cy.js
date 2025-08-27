describe('Basic Cypress Test', () => {
  it('should run without server', () => {
    // Basic assertion test
    expect(true).to.be.true
    cy.log('Cypress is working!')
  })

  it('should handle basic math', () => {
    const result = 2 + 2
    expect(result).to.equal(4)
  })

  it('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).to.have.length(5)
    expect(numbers[0]).to.equal(1)
  })
})
