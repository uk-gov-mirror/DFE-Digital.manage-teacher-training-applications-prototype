module.exports = (faker, params = {}) => {
  return {
    id: faker.random.uuid(),
    firstName: params.firstName || faker.name.firstName(),
    lastName: params.lastName || faker.name.lastName(),
    emailAddress: params.emailAddress || faker.name.emailAddress(),
    organisations: params.organisations
  }
}
