/* eslint-disable */

import { bookTour } from '/js/stripe.js'

const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')
const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe'

    const res = await axios({
      method: 'PATCH',
      url,
      data
    })

    console.log(res.data)

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`)
      window.setTimeout(() => {
        hideAlert()
      }, 1500)
    }
  } catch (error) {
    showAlert('error', error.response.data.message)
    window.setTimeout(() => {
      hideAlert()
    }, 1500)
  }
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])
    // const name = document.getElementById('name').value
    // const email = document.getElementById('email').value
    updateSettings(form, 'data')
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    document.querySelector('.btn--save-password').textContent = 'Updating...'

    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    )
    document.querySelector('.btn--save-password').textContent = 'Save password'

    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''
  })
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...'
    const { tourId } = e.target.dataset
    bookTour(tourId)
  })
}
