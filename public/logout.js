document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem('simgc_token');
  localStorage.removeItem('simgc_role');
  window.location.href = '/';
});
