
async function getHome(req, res) {
  try {
    let response = await fetch('http://localhost:8080/chatrooms');
    console.log(response.status); // 200
    console.log(response.statusText); // OK
    let data = await response.json();
    console.log(data);
    res.render('home', { title: 'Home', chatrooms: data });
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
  }
}

module.exports = {
  getHome
};