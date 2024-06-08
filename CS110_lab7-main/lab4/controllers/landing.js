async function getLanding(req, res) {
    res.render('landing_page', { title: 'Landing Page'});
}

  module.exports = {
    getLanding
  };