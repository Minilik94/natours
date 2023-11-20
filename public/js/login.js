/* eslint-disable  */
const hideAlert = () => {
  const el = document.querySelector('.alert')
  if (el) el.parentElement.removeChild(el)
}
const showAlert = (type, msg) => {
  hideAlert()

  const markup = `<div class="alert alert--${type}">${msg}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
}

const loginForm = document.querySelector('.form__login')

if (loginForm) {
  const login = async (email, password) => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/v1/users/login',
        data: {
          email,
          password
        }
      })

      if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully!')
        window.setTimeout(() => {
          location.assign('/')
        }, 1500)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        showAlert('error', err.response.data.message)
      } else {
        console.error('An error occurred:', err)
      }
    }
  }

  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    })
    if (res.data.status === 'success') location.reload(true)
  } catch (error) {
    showAlert('error', 'Error loggging out! Try again')
  }
}

const logoutBtn = document.querySelector('.nav__el.nav__el--logout')
console.log(logoutBtn)
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault()
    console.log(e)
    logout()
    window.setTimeout(() => {
      location.assign('/')
    }, 1500)
  })
}
