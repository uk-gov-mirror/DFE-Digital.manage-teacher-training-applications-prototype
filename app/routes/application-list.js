const PaginationHelper = require('../data/helpers/pagination')
const ApplicationHelper = require('../data/helpers/application')
const { DateTime } = require('luxon')
const _ = require('lodash')

const subjects = require('../data/subjects')

function getCheckboxValues (name, data) {
  return name && (Array.isArray(name) ? name : [name].filter((name) => {
    return name !== '_unchecked'
  })) || data
}

function getApplicationsByGroup (applications) {

  const previousCyclePendingConditions = applications
    .filter(app => app.status === "Awaiting conditions")
    .filter(app => app.cycle === '2019 to 2020')

  const deferredOffersPendingReconfirmation = applications
    .filter(app => app.status === 'Deferred')
    .filter(app => app.cycle === '2019 to 2020')

  const rejectedWithoutFeedback = applications
    .filter(app => app.status === 'Rejected')
    .filter(app => !app.rejectedReasons)

  const aboutToBeRejectedAutomatically = applications
    .filter(app => (app.status === 'Awaiting decision'))
    .filter(app => app.daysToRespond < 5)
    .sort(function(a, b) {
      return a.daysToRespond - b.daysToRespond
    })

  const awaitingDecision = applications
    .filter(app => (ApplicationHelper.getStatusText(app) === 'Received'))
    .filter(app => app.daysToRespond >= 5)
    .sort(function(a, b) {
      return a.daysToRespond - b.daysToRespond
    })

  const pendingInterview = applications
    .filter(app => (ApplicationHelper.getStatusText(app) === 'Interviewing'))
    .filter(app => app.daysToRespond >= 5)
    .sort(function(a, b) {
      return a.daysToRespond - b.daysToRespond
    })

  const waitingOn = applications
    .filter(app => app.status === 'Offered')
    .sort(function(a, b) {
      return a.offer.daysToDecline - b.offer.daysToDecline
    })

  const pendingConditions = applications
    .filter(app => app.status === 'Awaiting conditions')
    .filter(app => app.cycle === '2020 to 2021')

  const conditionsMet = applications
    .filter(app => app.status === 'Ready to enroll')

  const deferredOffers = applications
    .filter(app => app.status === 'Deferred')
    .filter(app => app.cycle === '2020 to 2021')

  let other = applications
    .filter(app => app.status !== 'Awaiting decision')
    .filter(app => app.status !== 'Deferred')
    .filter(app => app.status !== 'Offered')
    .filter(app => app.status !== 'Awaiting conditions')
    .filter(app => app.status !== 'Ready to enroll')
    .filter(app => app.status !== 'Rejected')

  // we have 5 of these
  const rejectedWithFeedback = applications
    .filter(app => app.status === 'Rejected')
    .filter(function (app) {
      return app.rejectedReasons
    })

  other = other.concat(rejectedWithFeedback)

  return {
    deferredOffersPendingReconfirmation,
    previousCyclePendingConditions,
    rejectedWithoutFeedback,
    aboutToBeRejectedAutomatically,
    awaitingDecision,
    pendingInterview,
    waitingOn,
    pendingConditions,
    conditionsMet,
    deferredOffers,
    other
  }
}

function flattenGroup (grouped) {
  var array = []
  array = array.concat(grouped.deferredOffersPendingReconfirmation)
  array = array.concat(grouped.previousCyclePendingConditions)
  array = array.concat(grouped.aboutToBeRejectedAutomatically)
  array = array.concat(grouped.rejectedWithoutFeedback)
  array = array.concat(grouped.awaitingDecision)
  array = array.concat(grouped.pendingInterview)
  array = array.concat(grouped.waitingOn)
  array = array.concat(grouped.pendingConditions)
  array = array.concat(grouped.conditionsMet)
  array = array.concat(grouped.deferredOffers)
  array = array.concat(grouped.other)
  return array
}

function addHeadings (grouped) {
  var array = []
  if (grouped.deferredOffersPendingReconfirmation.length) {
    array.push({
      heading: 'Deferred offers: review and confirm'
    })
    array = array.concat(grouped.deferredOffersPendingReconfirmation)
  }

  if (grouped.previousCyclePendingConditions.length) {
    array.push({
      heading: 'Offers pending conditions (previous cycle)'
    })
    array = array.concat(grouped.previousCyclePendingConditions)
  }

  if (grouped.aboutToBeRejectedAutomatically.length) {
    array.push({
      heading: 'Deadline approaching: make decision about application'
    })
    array = array.concat(grouped.aboutToBeRejectedAutomatically)
  }

  if (grouped.rejectedWithoutFeedback.length) {
    array.push({
      heading: 'Give feedback: you did not make a decision in time'
    })
    array = array.concat(grouped.rejectedWithoutFeedback)
  }

  if (grouped.awaitingDecision.length) {
    array.push({
      heading: 'Awaiting review'
    })
    array = array.concat(grouped.awaitingDecision)
  }

  if (grouped.pendingInterview.length) {
    array.push({
      heading: 'Interviewing'
    })
    array = array.concat(grouped.pendingInterview)
  }

  if (grouped.waitingOn.length) {
    array.push({
      heading: 'Waiting for candidate to respond to offer'
    })
    array = array.concat(grouped.waitingOn)
  }

  if (grouped.pendingConditions.length) {
    array.push({
      heading: 'Offers pending conditions (current cycle)'
    })
    array = array.concat(grouped.pendingConditions)
  }

  if (grouped.conditionsMet.length) {
    array.push({
      heading: 'Successful candidates'
    })
    array = array.concat(grouped.conditionsMet)
  }

  if (grouped.deferredOffers.length) {
    array.push({
      heading: 'Deferred offers'
    })
    array = array.concat(grouped.deferredOffers)
  }

  if (grouped.other.length) {
    if (grouped.deferredOffersPendingReconfirmation.length || grouped.aboutToBeRejectedAutomatically.length || grouped.rejectedWithoutFeedback.length || grouped.awaitingDecision.length || grouped.waitingOn.length || grouped.pendingConditions.length || grouped.conditionsMet.length) {
      array.push({
        heading: 'No action needed'
      })
    }
    array = array.concat(grouped.other)
  }
  return array
}

function getSubjectItems (answerValues) {
  const items = []

  subjects.forEach((item) => {
    const subject = {}
    subject.text = item.name
    subject.value = item.name
    subject.id = item.code

    if (answerValues !== undefined && answerValues !== null && answerValues.includes(item.name)) {
      subject.checked = true
    } else {
      subject.checked = false
    }

    items.push(subject)
  })

  return items
}

function getSelectedSubjectItems (selectedItems) {
  const items = []

  selectedItems.forEach((item) => {
    const subject = {}
    subject.text = item.text
    subject.href = `/remove-subject-filter/${item.text}`

    items.push(subject)
  })

  return items
}

module.exports = router => {
  router.all('/', (req, res) => {
    let apps = req.session.data.applications.map(app => app).reverse()

    let { cycle, status, provider, accreditedBody, keywords, location, studyMode, subject } = req.query

    keywords = keywords || req.session.data.keywords

    const cycles = getCheckboxValues(cycle, req.session.data.cycle)
    const statuses = getCheckboxValues(status, req.session.data.status)
    const providers = getCheckboxValues(provider, req.session.data.provider)
    const locations = getCheckboxValues(location, req.session.data.location)
    const accreditedBodies = getCheckboxValues(accreditedBody, req.session.data.accreditedBody)
    const studyModes = getCheckboxValues(studyMode, req.session.data.studyMode)
    const subjects = getCheckboxValues(subject, req.session.data.subject)

    const hasSearch = !!((keywords))

    const hasFilters = !!((cycles && cycles.length > 0) || (statuses && statuses.length > 0) || (locations && locations.length > 0) || (providers && providers.length > 0) || (accreditedBodies && accreditedBodies.length > 0) || (studyModes && studyModes.length > 0) || (subjects && subjects.length > 0))

    if (hasSearch) {
      apps = apps.filter((app) => {

        let candidateNameValid = true
        let candidatIdValid = true

        const candidateName = `${app.personalDetails.givenName} ${app.personalDetails.familyName}`
        const candidateId = app.id

        if (keywords) {
          candidateNameValid = candidateName.toLowerCase().includes(keywords.toLowerCase())
          candidateIdValid = candidateId.toLowerCase().includes(keywords.toLowerCase())
        }

        return candidateNameValid || candidateIdValid
      })
    }

    if (hasFilters) {
      apps = apps.filter((app) => {
        let cycleValid = true
        let statusValid = true
        let providerValid = true
        let locationValid = true
        let accreditedBodyValid = true
        let studyModeValid = true
        let subjectValid = true

        if (cycles && cycles.length) {
          cycleValid = cycles.includes(app.cycle)
        }

        if (statuses && statuses.length) {
          statusValid = statuses.includes(ApplicationHelper.getStatusText(app))
        }

        if (locations && locations.length) {
          locationValid = locations.includes(app.location)
        }

        if (providers && providers.length) {
          providerValid = providers.includes(app.provider)
        }

        if (accreditedBodies && accreditedBodies.length) {
          accreditedBodyValid = accreditedBodies.includes(app.accreditedBody)
        }

        if (subjects && subjects.length) {
          subjectValid = subjects.includes(app.subject)
        }

        if (studyModes && studyModes.length) {
          studyModeValid = studyModes.includes(app.studyMode)
        }

        return cycleValid && statusValid && locationValid && providerValid && accreditedBodyValid && studyModeValid && subjectValid
      })
    }

    let selectedFilters = null
    if (hasFilters) {
      selectedFilters = {
        categories: []
      }

      if (cycles && cycles.length) {
        selectedFilters.categories.push({
          heading: { text: 'Year received' },
          items: cycles.map((cycle) => {
            return {
              text: cycle,
              href: `/remove-cycle-filter/${cycle}`
            }
          })
        })
      }

      if (statuses && statuses.length) {
        selectedFilters.categories.push({
          heading: { text: 'Statuses' },
          items: statuses.map((status) => {
            return {
              text: status,
              href: `/remove-status-filter/${status}`
            }
          })
        })
      }

      if (locations && locations.length) {
        selectedFilters.categories.push({
          heading: { text: 'Training locations for ' + req.session.data.trainingProviders[1].name },
          items: locations.map((location) => {
            return {
              text: location,
              href: `/remove-location-filter/${location}`
            }
          })
        })
      }

      if (providers && providers.length) {
        selectedFilters.categories.push({
          heading: { text: 'Providers' },
          items: providers.map((provider) => {
            return {
              text: provider,
              href: `/remove-provider-filter/${provider}`
            }
          })
        })
      }

      if (accreditedBodies && accreditedBodies.length) {
        selectedFilters.categories.push({
          heading: { text: 'Courses ratified by' },
          items: accreditedBodies.map((accreditedBody) => {
            return {
              text: accreditedBody,
              href: `/remove-accreditedBody-filter/${accreditedBody}`
            }
          })
        })
      }

      if (subjects && subjects.length) {
        selectedFilters.categories.push({
          heading: { text: 'Subjects' },
          items: subjects.map((subject) => {
            return {
              text: subject,
              href: `/remove-subject-filter/${subject}`
            }
          })
        })
      }

      if (studyModes && studyModes.length) {
        selectedFilters.categories.push({
          heading: { text: 'Full time or part time' },
          items: studyModes.map((studyMode) => {
            return {
              text: studyMode,
              href: `/remove-studyMode-filter/${studyMode}`
            }
          })
        })
      }
    }

    // TODO: clean up
    let applications = apps;

    let allApplications = applications;

    applications = applications.map((application) => {
      application.statusText = ApplicationHelper.getStatusText(application)
      return application
    })

    // Whack all the grouped items into an array without headings
    let grouped = getApplicationsByGroup(applications)

    // Put groups into ordered array
    applications = flattenGroup(grouped)

    // Get the pagination data
    let pagination = PaginationHelper.getPagination(applications, req.query.page)

    // Get a slice of the data to display
    applications = PaginationHelper.getDataByPage(applications, pagination.pageNumber)

    const subjectItems = getSubjectItems(req.session.data.subject)
    const selectedSubjects = getSelectedSubjectItems(subjectItems.filter(subject => subject.checked === true))

    // now mixin the headings
    grouped = getApplicationsByGroup(applications)
    applications = addHeadings(grouped)

    res.render('index', {
      allApplications,
      applications,
      pagination,
      selectedFilters,
      hasFilters,
      subjectItems,
      subjectItemsDisplayLimit: 15,
      selectedSubjects
    })
  })

  router.get('/remove-keywords-search', (req, res) => {
    req.session.data.keywords = ''
    res.redirect('/')
  })

  router.get('/remove-cycle-filter/:cycle', (req, res) => {
    req.session.data.cycle = req.session.data.cycle.filter(item => item !== req.params.cycle)
    res.redirect('/')
  })

  router.get('/remove-status-filter/:status', (req, res) => {
    req.session.data.status = req.session.data.status.filter(item => item !== req.params.status)
    res.redirect('/')
  })

  router.get('/remove-provider-filter/:provider', (req, res) => {
    req.session.data.provider = req.session.data.provider.filter(item => item !== req.params.provider)
    res.redirect('/')
  })

  router.get('/remove-location-filter/:location', (req, res) => {
    req.session.data.location = req.session.data.location.filter(item => item !== req.params.location)
    res.redirect('/')
  })

  router.get('/remove-accreditedBody-filter/:accreditedBody', (req, res) => {
    req.session.data.accreditedBody = req.session.data.accreditedBody.filter(item => item !== req.params.accreditedBody)
    res.redirect('/')
  })

  router.get('/remove-subject-filter/:subject', (req, res) => {
    req.session.data.subject = req.session.data.subject.filter(item => item !== req.params.subject)
    res.redirect('/')
  })

  router.get('/remove-studyMode-filter/:studyMode', (req, res) => {
    req.session.data.studyMode = req.session.data.studyMode.filter(item => item !== req.params.studyMode)
    res.redirect('/')
  })

  router.get('/remove-all-filters', (req, res) => {
    req.session.data.cycle = null
    req.session.data.status = null
    req.session.data.provider = null
    req.session.data.accreditedBody = null
    req.session.data.location = null
    req.session.data.subject = null
    req.session.data.studyMode = null
    res.redirect('/')
  })

}
