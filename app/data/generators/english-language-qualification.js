module.exports = (faker) => {
  const type = faker.helpers.randomize([
    'IELTS',
    'TOEFL',
    'Pearson Test of English (Academic)',
    'Cambridge IGCSE English as a Second Language'
  ])

  let grade
  let gradeLabel
  let reference
  let referenceLabel
  if (type === 'IELTS') {
    grade = '7.5'
    gradeLabel = 'Overall band score'
    reference = '02GB0674SOOM599A'
    referenceLabel = 'Test report form (TRF) number'
  } else if (type === 'TOEFL') {
    grade = '92'
    gradeLabel = 'Total score'
    reference = '0000 0000 2500 2147'
    referenceLabel = 'TOEFL registration number'
  } else {
    grade = 'B'
    gradeLabel = 'Score or grade'
    reference = false
  }

  const hasQualification = faker.helpers.randomize([
    'Yes',
    'No',
    'Not needed'
  ])
  switch (hasQualification) {
    case 'Yes':
      return {
        hasQualification,
        status: 'Candidate has an English as a foreign language qualification',
        type,
        grade,
        gradeLabel,
        reference,
        referenceLabel,
        year: faker.date.between('2010', '2020')
      }
    case 'No':
      return {
        hasQualification,
        status: 'Candidate does not have an English as a foreign language qualification yet',
        missing: 'I have booked to take an IELTS test next month.'
      }
    default:
      return {
        hasQualification,
        status: 'English is not a foreign language to the candidate'
      }
  }
}

/*
Have you done an English as a foreign language assessment?
Yes
No, English is not a foreign language to me
No, I have not done an English as a foreign language assessment
| If you’re planning on doing an assessment, give details here (optional)

// if yes
What English language assessment did you do?
International English Language Testing System (IELTS)
Test of English as a Foreign Language (TOEFL)
Other

// if IELTS
Test report form (TRF) number
For example, 02GB0674SOOM599A
[                            ]

Overall band score
For example, 7.5
[                              ]

When did you complete the assessment?
Give the year, for example: ‘2020’
[        ]

// if TOEFL
TOEFL registration number
For example, 0000 0000 2500 2147
[                              ]

Total score
For example, 92
[        ]

When did you complete the assessment?
Give the year, for example: ‘2020’
[        ]

// if other

Assessment name
For example, CAE (Cambridge Advanced English), Pearson Test of English
[                              ]

Score or grade
[                              ]

When did you complete the assessment?
Give the year, for example: ‘2020’
[         ]

*/
