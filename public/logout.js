document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem('simgc_role');
  document.cookie = 'simgc_token=; path=/; Max-Age=0; SameSite=Lax';
  window.location.href = '/';
});
