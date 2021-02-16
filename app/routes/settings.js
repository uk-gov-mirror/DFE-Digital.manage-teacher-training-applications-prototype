const applications = require('../data/applications')
const _ = require('lodash');
module.exports = router => {

  router.get('/admin/settings', (req, res) => {
    res.render('admin/settings', {
      internationalApplications: req.session.data.applications.filter((app) => {
        return app.personalDetails.isInternationalCandidate
      })
    })
  })

  router.post('/admin/settings/new-cycle', (req, res) => {

    var settings = req.session.data.settings

    if(settings.includes('new-cycle')) {
      req.session.data.applications = applications.filter(app => {
        if (app.status === 'Deferred' && app.cycle === '2019 to 2020') {
          return false;
        } else {
          return true;
        }
      })
      .filter(app => {
        if (app.status === 'Accepted' && app.cycle === '2019 to 2020') {
          return false;
        } else {
          return true;
        }
      })
      _.remove(settings, function(item) { return item == 'new-cycle' })
    } else {
      let deferredPast = applications
        .filter(app => app.cycle == "2019 to 2020")
        .filter(app => (app.status == 'Deferred'))

      let acceptedPast = applications
        .filter(app => app.cycle == "2019 to 2020")
        .filter(app => (app.status == 'Accepted'))

      let other = applications
        .filter(app => app.status !== 'Awaiting decision')
        .filter(app => app.status !== 'Deferred')
        .filter(app => app.status !== 'Offered')
        .filter(app => app.status !== 'Accepted')
        .filter(app => app.status !== 'Conditions met')

      req.session.data.applications = deferredPast.concat(acceptedPast).concat(other);

      settings.push('new-cycle')
    }
    res.redirect('/admin/settings')
  })

  router.post('/admin/settings/combine-conditions', (req, res) => {
    var settings = req.session.data.settings

    if(settings.includes('hasCombinedConditions')) {
      _.remove(settings, function(item) { return item == 'hasCombinedConditions' })
    } else {
       settings.push('hasCombinedConditions')
    }
    res.redirect('/admin/settings')
  })

}
