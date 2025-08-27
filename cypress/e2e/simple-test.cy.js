describe('Simple Test', () => {
  it('should work without server', () => {
    // This test just verifies Cypress is working
    expect(true).to.be.true
    cy.log('Cypress is working!')
  })

  it('should handle basic assertions', () => {
    const testData = { name: 'Test', value: 42 }
    expect(testData.name).to.equal('Test')
    expect(testData.value).to.equal(42)
  })
})
