const utils = require('../data/application-utils')

module.exports = router => {

  router.get('/application/:applicationId/offer', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    res.render('application/offer/index', {
      application,
      conditions: utils.getConditions(application)
    })
  })

  router.get('/application/:applicationId/offer/defer/check', (req, res) => {
    res.render('application/offer/defer/check', {
      application: req.session.data.applications.find(app => app.id === req.params.applicationId)
    })
  })

  router.post('/application/:applicationId/offer/defer/check', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)
    application.status = 'Deferred'
    application.events.items.push({
      date: new Date().toISOString(),
      user: "Alicia Grenada",
      title: "Offer deferred"
    })

    req.flash('success', 'Offer successfully deferred')
    res.redirect(`/application/${applicationId}/offer`)
  })

  router.get('/application/:applicationId/offer/edit-conditions', (req, res) => {
    let application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    if(!req.session.data['edit-conditions'] || !req.session.data['edit-conditions']['standard-conditions']) {
      var standardConditions = application.offer.standardConditions.map(condition => {
        return condition.description
      })
    }

    res.render('application/offer/edit-conditions/index', {
      application,
      standardConditions
    })
  })

  router.post('/application/:applicationId/offer/edit-conditions', (req, res) => {
    res.redirect(`/application/${req.params.applicationId}/offer/edit-conditions/check`)
  })

  router.get('/application/:applicationId/offer/edit-conditions/check', (req, res) => {
    let application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    res.render('application/offer/edit-conditions/check', {
      application
    })
  })




}
