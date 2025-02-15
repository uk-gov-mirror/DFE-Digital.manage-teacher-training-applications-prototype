const express = require('express')
const router = express.Router()

router.all('*', (req, res, next) => {
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

require('./routes/application-list')(router)
require('./routes/activity-log')(router)
require('./routes/set-up-permissions')(router)
require('./routes/applications')(router)
require('./routes/reject-application')(router)
require('./routes/offer')(router)
require('./routes/make-offer')(router)
require('./routes/edit-offer')(router)
require('./routes/withdraw-offer')(router)
require('./routes/defer-offer')(router)
require('./routes/reconfirm-offer')(router)
require('./routes/edit-condition-statuses')(router)
require('./routes/notes')(router)
require('./routes/interviews')(router)
require('./routes/organisations')(router)
require('./routes/users')(router)
require('./routes/email')(router)
require('./routes/settings')(router)
require('./routes/notifications')(router)
require('./routes/withdraw-application')(router)

// TODO: clean up registration flows when onboarding work finished
require('./routes/register1')(router)
require('./routes/register2')(router)
require('./routes/register3')(router)
require('./routes/register4')(router)
require('./routes/register')(router)

module.exports = router
