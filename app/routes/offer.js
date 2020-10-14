const utils = require('../data/application-utils')
const { v4: uuidv4 } = require('uuid')
const _ = require('lodash');

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

    var conditions = []

    if(req.session.data['edit-conditions']['standard-conditions'].length) {
      conditions = conditions.concat(req.session.data['edit-conditions']['standard-conditions'])
    }

    if (req.session.data['edit-conditions']['condition-1']){
      conditions.push(req.session.data['edit-conditions']['condition-1'])
    }
    if (req.session.data['edit-conditions']['condition-2']){
      conditions.push(req.session.data['edit-conditions']['condition-2'])
    }
    if (req.session.data['edit-conditions']['condition-3']){
      conditions.push(req.session.data['edit-conditions']['condition-3'])
    }
    if (req.session.data['edit-conditions']['condition-4']){
      conditions.push(req.session.data['edit-conditions']['condition-4'])
    }

    res.render('application/offer/edit-conditions/check', {
      application,
      conditions
    })
  })

  router.post('/application/:applicationId/offer/edit-conditions/check', (req, res) => {
    let application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    // save standard conditions
    application.offer.standardConditions = [];
    if(req.session.data['edit-conditions']['standard-conditions'].length) {
      req.session.data['edit-conditions']['standard-conditions'].forEach(condition => {
        application.offer.standardConditions.push({
          id: uuidv4(),
          description: condition,
          status: "Pending"
        })
      });
    }

    // save further conditions
    application.offer.conditions = [];
    if (req.session.data['edit-conditions']['condition-1']){
      application.offer.conditions.push({
        id: uuidv4(),
        description: req.session.data['edit-conditions']['condition-1'],
        status: "Pending"
      })
    }
    if (req.session.data['edit-conditions']['condition-2']){
      application.offer.conditions.push({
        id: uuidv4(),
        description: req.session.data['edit-conditions']['condition-2'],
        status: "Pending"
      })
    }
    if (req.session.data['edit-conditions']['condition-3']){
      application.offer.conditions.push({
        id: uuidv4(),
        description: req.session.data['edit-conditions']['condition-3'],
        status: "Pending"
      })
    }
    if (req.session.data['edit-conditions']['condition-4']){
      application.offer.conditions.push({
        id: uuidv4(),
        description: req.session.data['edit-conditions']['condition-4'],
        status: "Pending"
      })
  }

    req.flash('success', 'Offer updated successfully')
    res.redirect(`/application/${req.params.applicationId}/offer`)
  })


  // delete a condition
  router.get('/application/:applicationId/condition/:conditionId/delete', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)
    const condition = utils.getCondition(application, req.params.conditionId)
    const remainingConditions = utils.getConditions(application).filter(c => c.id !== condition.id)
    let hasRemainingConditions = remainingConditions.length;
    let allRemainingConditionsComplete = false;
    if(remainingConditions.length) {
      allRemainingConditionsComplete = remainingConditions.every(condition => condition.status == "Met")
    }

    res.render('application/offer/delete-condition/index', {
      application,
      condition,
      hasRemainingConditions,
      allRemainingConditionsComplete
    })
  })

  router.post('/application/:applicationId/condition/:conditionId/delete', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    utils.deleteCondition(application, req.params.conditionId)

    if(utils.getConditions(application).length == 0) {
      application.status = "Conditions met";
    }

    req.flash('success', 'Condition deleted successfully')
    res.redirect(`/application/${req.params.applicationId}/offer`)

  })


  // Edit condition statuses (in bulk)
  router.get('/application/:applicationId/offer/edit-condition-statuses', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)
    const conditions = utils.getConditions(application)

    if(req.session.data['edit-condition-statuses']) {
      console.log(req.session.data['edit-condition-statuses']['conditions'])
    }

    res.render('application/offer/edit-condition-statuses/index', {
      application,
      conditions
    })
  })

  router.post('/application/:applicationId/offer/edit-condition-statuses', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    res.redirect(`/application/${req.params.applicationId}/offer/edit-condition-statuses/check`)
  })

  router.get('/application/:applicationId/offer/edit-condition-statuses/check', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    // mixin new data statuses with conditions
    let conditions = utils.getConditions(application).map(condition => {
      return {
        id: condition.id,
        description: condition.description,
        status: req.session.data['edit-condition-statuses']['conditions'][condition.id]
      }
    })

    let hasNotMetConditions = _.some(conditions, (condition) => {
      return condition.status === "Not met"
    })

    let allConditionsMet = _.every(conditions, (condition) => {
      return condition.status === "Met"
    })

    res.render('application/offer/edit-condition-statuses/check', {
      application,
      conditions,
      hasNotMetConditions,
      allConditionsMet
    })
  })


}
