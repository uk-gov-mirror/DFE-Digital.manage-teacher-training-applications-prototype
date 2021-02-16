const faker = require('faker')
faker.locale = 'en_GB'

module.exports = (params) => {
  // Can you complete a 3-minute questionnaire?
  // Yes, continue to the questionnaire
  // No, continue without completing questionnaire
  const answered = faker.helpers.randomize([true, true, false])

  const sexInteger = params.sexInteger

  let sex
  let ethnicGroup
  let ethnicDescription
  let areYouDisabled
  let disabilities

  if (answered){

    // What is your sex?
    sex = { 0: "Male", 1: "Female" }[sexInteger]

    // What is your ethnic group?
    ethnicGroup = faker.helpers.randomize([
      "Asian or Asian British",
      "Black, African, Black British or Caribbean",
      "Mixed or multiple ethnic groups",
      "White",
      "Another ethnic group",
      "Prefer not to say"
    ])

    // Which of the following best describes your Asian or Asian British background?
    if(ethnicGroup == 'Asian or Asian British') {
      ethnicDescription = faker.helpers.randomize([
        'Bangladeshi',
        'Chinese',
        'Indian',
        'Pakistani',
        'Prefer not to say'
        // 'another Asian background - Your Asian background (optional)'
      ])
    }

    //Which of the following best describes your Black, African, Black British or Caribbean background?
    if(ethnicGroup == 'Black, African, Black British or Caribbean') {
      ethnicDescription = faker.helpers.randomize([
        'African',
        'Carribean',
        'Indian',
        'Prefer not to say'
        // 'Another Black background - Your Black background (optional)'
      ])
    }

    // Which of the following best describes your Mixed or multiple ethnic groups background?
    if(ethnicGroup == 'Mixed or multiple ethnic groups') {
      ethnicDescription = faker.helpers.randomize([
        'Asian and White',
        'Black African and White',
        'Black Caribbean and White',
        'Prefer not to say'
        // 'Another Mixed background - Your Mixed background (optional)'
      ])
    }

    // Which of the following best describes your White background?
    if(ethnicGroup == 'White') {
      ethnicDescription = faker.helpers.randomize([
        'British, English, Northern Irish, Scottish, or Welsh',
        'Irish',
        'Irish Traveller or Gypsy',
        'Prefer not to say'
        // 'Another White background - Your White background (optional)'
      ])
    }

    // Which of the following best describes your ethnicity?
    if(ethnicGroup == 'Another ethnic group') {
      ethnicDescription = faker.helpers.randomize([
        'Arab',
        'Irish',
        'Irish Traveller or Gypsy',
        'Prefer not to say'
        // 'Another ethnic background - Describe your ethnic background (optional)'
      ])
    }

    // Are you disabled?
    areYouDisabled = faker.helpers.randomize(["Yes", "No", "Prefer not to say"])

    disabilityCount = faker.random.number(3); // up to 3 disabilities

    // Please select all that apply to you
    let disabilityChoices = [
      "Blind",
      "Deaf",
      "Learning difficulty",
      "Long-standing illness",
      "Mental health condition",
      "Physical disability or mobility issue",
      "Social or communication impairment",
      "Other"
    ]

    let shuffledDisabilities = disabilityChoices.sort(() => 0.5 - Math.random());

    if (areYouDisabled=="Yes" && disabilityCount){
      disabilities = shuffledDisabilities.slice(0, disabilityCount).sort();
    }

  }

  return {
    answered,
    sex,
    ethnicGroup,
    ethnicDescription,
    areYouDisabled,
    disabilities
  }
}
